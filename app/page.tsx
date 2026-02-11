"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Trash2, MessageSquare, LogOut, Send, CheckCircle2, Plus, BellRing, Camera, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CORES_PASTEL = ['#f5886c', '#1260c7', '#ffce0a', '#b8e1dd', '#d1c4e9', '#f8bbd0', '#e1f5fe', '#c5e1a5', '#ffe082'];

export default function AgendaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [perfilAtivo, setPerfilAtivo] = useState<any>(null);
  const [dataAtiva, setDataAtiva] = useState(new Date()); 
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPerfilSelector, setShowPerfilSelector] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [capaImage, setCapaImage] = useState<string | null>(null);
  const [enviandoZap, setEnviandoZap] = useState(false);
  const [eventosDoDiaSelecionado, setEventosDoDiaSelecionado] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempEvento, setTempEvento] = useState({ id: '', dataInicio: '', dataTermino: '', titulo: '', conteudoSecundario: '', linkDrive: '', cor: CORES_PASTEL[0], perfil: '', chatId: '', tipo: 'externo', horaInicio: '08:00', horaFim: '09:00' });

  const carregarDados = async () => {
    try {
      const res = await fetch('/api/agenda', { cache: 'no-store' });
      const data = await res.json();
      if (data.events) setEventos(data.events);
      if (data.feed) setFeed(data.feed);
      if (data.perfis) {
        setPerfis(data.perfis);
        if (!perfilAtivo) {
            const logado = data.perfis.find((p: any) => p.email?.toLowerCase() === session?.user?.email?.toLowerCase());
            setPerfilAtivo(logado || data.perfis[0]);
        }
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    const savedCapa = localStorage.getItem('agenda_capa_marketing');
    if (savedCapa) setCapaImage(savedCapa);
    if (status === "authenticated") { carregarDados(); const interval = setInterval(carregarDados, 15000); return () => clearInterval(interval); }
  }, [status]);

  const handleSalvar = async () => {
    const payload = { ...tempEvento, dataInicio: `${tempEvento.dataInicio} ${tempEvento.horaInicio}`, dataFim: `${tempEvento.dataTermino} ${tempEvento.horaFim}` };
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) { setShowEventModal(false); carregarDados(); }
  };

  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const diasNoMes = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 0).getDate(), [dataAtiva]);
  const primeiroDiaSemana = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), 1).getDay(), [dataAtiva]);

  const isDiaNoPeriodo = (diaStr: string, ini: string, fim: string) => {
    const d = new Date(diaStr + 'T00:00:00');
    const i = new Date(ini?.split(' ')[0] + 'T00:00:00');
    const f = new Date(fim?.split(' ')[0] + 'T00:00:00');
    return d >= i && d <= f;
  };

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      <AnimatePresence>
        {showSidebar && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-r-2 border-black p-6 bg-gray-50 flex flex-col h-full overflow-hidden relative">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2"><BellRing size={24} className="text-[#1260c7]" /> Atividade</h2>
            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar custom-scrollbar">
              {feed.map((item, idx) => (
                <div key={idx} className="bg-white border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_black]">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-black text-white ${item.Tipo === 'ENVIO' ? 'bg-[#1260c7]' : 'bg-[#22c55e]'}`}>{item.Tipo}</span>
                    <span className="text-[8px] font-bold opacity-30">{item.Data?.split(',')[1]}</span>
                  </div>
                  <p className="font-black text-xs uppercase truncate">{item.Nome}</p>
                  <p className="text-[10px] opacity-70 mt-1 font-bold italic truncate">{item.Evento || (item.Resposta === 'SIM' ? 'Solicitou ajuda' : 'De acordo')}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white relative">
        <button onClick={() => setShowSidebar(!showSidebar)} className="absolute top-4 left-4 z-[100] bg-white border-2 border-black p-2 rounded-xl shadow-md"><Menu size={20}/></button>
        
        <div className="relative mb-10 h-72 rounded-[40px] border-2 border-black overflow-hidden flex items-end p-8">
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => { localStorage.setItem('agenda_capa_marketing', r.result as string); setCapaImage(r.result as string); }; r.readAsDataURL(file); } }} />
          <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer z-0 bg-gray-100 flex items-center justify-center text-gray-400 font-bold overflow-hidden">{capaImage ? <img src={capaImage} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center"><Camera size={40}/><p>ADICIONAR CAPA</p></div>}</div>
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full border-2 border-black bg-white flex items-center justify-center text-4xl font-black shadow-lg uppercase overflow-hidden">{perfilAtivo?.nome?.charAt(0)}</div>
              <div className="bg-white border-2 border-black px-6 py-2 rounded-2xl flex items-center gap-4 cursor-pointer shadow-md" onClick={() => setShowPerfilSelector(!showPerfilSelector)}>
                <div><h3 className="text-xl font-black uppercase leading-none">{perfilAtivo?.nome || "Perfil"}</h3><p className="text-[9px] font-bold opacity-40 uppercase">{perfilAtivo?.email}</p></div>
                <ChevronDown className="opacity-40" />
              </div>
            </div>
            <button onClick={() => signOut()} className="bg-white border-2 border-black p-4 rounded-2xl font-bold uppercase text-xs shadow-md">Sair</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {diasSemana.map(d => <div key={d} className="text-center font-black opacity-20 text-xs uppercase">{d}</div>)}
          {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={i} />)}
          {Array.from({ length: diasNoMes }, (_, i) => {
            const dia = i + 1;
            const key = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const evs = eventos.filter(e => isDiaNoPeriodo(key, e.dataInicio, e.dataFim));
            return (
              <div key={dia} onClick={() => {
                const dataStr = key;
                setTempEvento({ ...tempEvento, id: '', dataInicio: dataStr, dataTermino: dataStr, perfil: perfilAtivo?.nome, chatId: perfilAtivo?.chatId });
                setShowEventModal(true);
              }} className={`h-32 border-2 border-black rounded-[30px] p-4 cursor-pointer transition-all hover:scale-105 ${dataAtiva.getDate() === dia ? 'bg-orange-50' : 'bg-white'}`}>
                <span className="text-2xl font-black">{dia}</span>
                <div className="flex gap-1 mt-2 flex-wrap">{evs.map((ev, idx) => <div key={idx} className="w-3 h-3 rounded-full border border-black shadow-sm" style={{ backgroundColor: ev.cor }} />)}</div>
              </div>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white border-2 border-black rounded-[60px] p-12 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                <h2 className="text-4xl font-black uppercase">Evento</h2>
                <div className="flex gap-2">{CORES_PASTEL.map(c => <div key={c} onClick={() => setTempEvento({...tempEvento, cor: c})} className={`w-7 h-7 rounded-full border-2 border-black cursor-pointer ${tempEvento.cor === c ? 'scale-125' : 'opacity-30'}`} style={{ backgroundColor: c }} />)}</div>
                <X className="cursor-pointer" onClick={() => setShowEventModal(false)} />
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <select value={tempEvento.perfil} onChange={e => { const p = perfis.find(it => it.nome === e.target.value); setTempEvento({...tempEvento, perfil: e.target.value, chatId: p?.chatId || ''}); }} className="border-2 border-black rounded-2xl p-4 font-bold bg-gray-50 outline-none uppercase">{perfis.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}</select>
                  <div className="flex border-2 border-black rounded-2xl overflow-hidden font-black text-xs h-[60px]"><button onClick={() => setTempEvento({...tempEvento, tipo: 'externo'})} className={`flex-1 ${tempEvento.tipo === 'externo' ? 'bg-[#1260c7] text-white' : 'bg-white'}`}>EXTERNO</button><button onClick={() => setTempEvento({...tempEvento, tipo: 'interno'})} className={`flex-1 ${tempEvento.tipo === 'interno' ? 'bg-black text-white' : 'bg-white'}`}>INTERNO</button></div>
                </div>
                <div className="bg-gray-50 p-8 rounded-[40px] border-2 border-black/5 grid grid-cols-2 gap-8">
                  <div className="space-y-4"><p className="text-[10px] font-black uppercase opacity-30 flex items-center gap-1"><CalendarIcon size={12}/> Início</p><input type="date" value={tempEvento.dataInicio} onChange={e => setTempEvento({...tempEvento, dataInicio: e.target.value})} className="text-xl font-black bg-transparent w-full border-b border-black outline-none" /><input type="time" value={tempEvento.horaInicio} onChange={e => setTempEvento({...tempEvento, horaInicio: e.target.value})} className="text-3xl font-black bg-transparent w-full outline-none" /></div>
                  <div className="space-y-4"><p className="text-[10px] font-black uppercase opacity-30 flex items-center gap-1"><CalendarIcon size={12}/> Término</p><input type="date" value={tempEvento.dataTermino} onChange={e => setTempEvento({...tempEvento, dataTermino: e.target.value})} className="text-xl font-black bg-transparent w-full border-b border-black outline-none" /><input type="time" value={tempEvento.horaFim} onChange={e => setTempEvento({...tempEvento, horaFim: e.target.value})} className="text-3xl font-black bg-transparent w-full outline-none" /></div>
                </div>
                <input value={tempEvento.titulo} onChange={e => setTempEvento({...tempEvento, titulo: e.target.value})} className="w-full text-4xl font-black bg-transparent outline-none uppercase border-b-2 border-black/10 py-2" placeholder="CONTEÚDO" />
                <textarea value={tempEvento.conteudoSecundario} onChange={e => setTempEvento({...tempEvento, conteudoSecundario: e.target.value})} className="w-full text-xl font-bold bg-transparent outline-none h-24 resize-none" placeholder="Descrição..." />
                <div className="grid grid-cols-2 gap-6"><div className="border-2 border-black p-4 rounded-2xl bg-[#ffce0a]/10"><p className="text-[9px] font-black uppercase opacity-40">ChatId</p><p className="font-mono text-xs">{tempEvento.chatId}</p></div><div className="border-2 border-black p-4 rounded-2xl bg-white"><p className="text-[9px] font-black uppercase opacity-40">Drive</p><input value={tempEvento.linkDrive} onChange={e => setTempEvento({...tempEvento, linkDrive: e.target.value})} className="w-full font-bold text-xs outline-none bg-transparent" /></div></div>
                <div className="flex justify-between items-center pt-8 border-t-2 border-black font-black uppercase text-2xl"><button onClick={handleSalvar} className="hover:underline decoration-[#ffce0a] decoration-[12px]">Gravar</button><button onClick={() => setShowEventModal(false)} className="opacity-20">Voltar</button></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
