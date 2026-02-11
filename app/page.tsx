"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Trash2, LogOut, Send, CheckCircle2, Plus, BellRing, Camera, Menu } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempEvento, setTempEvento] = useState({ id: '', dataInicio: '', dataTermino: '', titulo: '', conteudoSecundario: '', linkDrive: '', cor: CORES_PASTEL[0], perfil: '', chatId: '', tipo: 'externo', horaInicio: '08:00', horaFim: '09:00' });

  const carregarDados = async (isFirstLoad = false) => {
    try {
      const res = await fetch('/api/agenda', { cache: 'no-store' });
      const data = await res.json();
      if (data.events) setEventos(data.events);
      if (data.perfis) setPerfis(data.perfis);
      if (data.feed) setFeed(data.feed);
      
      if (isFirstLoad && data.perfis && !perfilAtivo) {
          const logado = data.perfis.find((p: any) => p.email?.toLowerCase() === session?.user?.email?.toLowerCase());
          setPerfilAtivo(logado || data.perfis[0]);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    const savedCapa = localStorage.getItem('agenda_capa_marketing');
    if (savedCapa) setCapaImage(savedCapa);
    if (status === "authenticated") {
        carregarDados(true);
        const interval = setInterval(() => carregarDados(false), 15000); 
        return () => clearInterval(interval);
    }
  }, [status, session]);

  const handleSalvarPerfil = async () => {
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify({ isPerfilUpdate: true, email: perfilAtivo.email, nome: perfilAtivo.nome, chatId: perfilAtivo.chatId }) });
    if (res.ok) { alert("Perfil e Tarefas Sincronizadas!"); setShowPerfilModal(false); carregarDados(); }
  };

  const handleSalvarEvento = async () => {
    const payload = { ...tempEvento, dataInicio: `${tempEvento.dataInicio} ${tempEvento.horaInicio}`, dataFim: `${tempEvento.dataTermino} ${tempEvento.horaFim}`, chatId: tempEvento.chatId || perfis.find(p => p.nome === tempEvento.perfil)?.chatId || '' };
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) { setShowEventModal(false); carregarDados(); }
  };

  const handleExcluirEvento = async () => {
    if (!tempEvento.id) return;
    if (!confirm("Excluir este evento permanentemente?")) return;
    const res = await fetch('/api/agenda', { method: 'DELETE', body: JSON.stringify({ id: tempEvento.id }) });
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
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-r-2 border-black p-6 bg-gray-50 flex flex-col h-full overflow-hidden relative z-50">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2"><BellRing size={24} className="text-[#1260c7]" /> Atividade</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar custom-scrollbar">
              {feed.map((item, idx) => (
                <div key={idx} className="bg-white border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0_black]">
                  <p className="font-black text-[10px] uppercase truncate">{item.Nome}</p>
                  <p className="text-[9px] font-bold opacity-70 mt-1 italic">{item.Tipo === 'RESPOSTA' ? (item.Resposta === 'SIM' ? 'Precisa de ajuda' : 'Está de acordo') : `🚀 ${item.Evento}`}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white relative">
        <button onClick={() => setShowSidebar(!showSidebar)} className="absolute top-4 left-4 z-[100] bg-white border-2 border-black p-2 rounded-xl shadow-md hover:bg-black hover:text-white transition-all"><Menu size={20}/></button>

        <div className="relative z-30 flex items-center justify-between mb-6 h-20 ml-12">
            <div className="flex items-center gap-6">
                <div className="relative z-40">
                    <div className="w-20 h-20 rounded-full border-2 border-black bg-white flex items-center justify-center text-4xl font-black shadow-lg uppercase overflow-hidden">{session?.user?.image ? <img src={session.user.image} className="w-full h-full object-cover" /> : (perfilAtivo?.nome?.charAt(0) || 'A')}</div>
                    <button onClick={() => setShowPerfilModal(true)} className="absolute -top-1 -left-1 bg-white border-2 border-black rounded-full p-2 hover:bg-black hover:text-white shadow-md z-50"><Settings size={18} /></button>
                </div>
                <div className="relative z-40">
                    <div onClick={() => setShowPerfilSelector(!showPerfilSelector)} className="bg-white border-2 border-black px-6 py-2 rounded-2xl flex items-center gap-4 cursor-pointer shadow-md" >
                        <div><h3 className="text-xl font-black uppercase leading-none">{perfilAtivo?.nome || "Perfil"}</h3><p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{perfilAtivo?.email}</p></div>
                        <ChevronDown className={`transition-transform ${showPerfilSelector ? 'rotate-180' : ''}`} />
                    </div>
                    {showPerfilSelector && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-black rounded-2xl shadow-xl z-[100] overflow-hidden">
                            {perfis.map(p => (
                                <div key={p.email} onClick={() => { setPerfilAtivo(p); setShowPerfilSelector(false); }} className="p-4 hover:bg-gray-100 cursor-pointer font-black uppercase text-xs border-b border-black last:border-0">{p.nome}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <button onClick={() => signOut()} className="bg-white border-2 border-black p-4 rounded-2xl font-black uppercase text-xs shadow-md z-40 hover:bg-red-500 hover:text-white transition-colors">Sair</button>
        </div>

        <div className="relative mb-10 h-64 rounded-[40px] border-2 border-black overflow-hidden bg-gray-100 z-0 shadow-md">
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => { setCapaImage(r.result as string); localStorage.setItem('agenda_capa_marketing', r.result as string); }; r.readAsDataURL(file); } }} />
          <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer flex items-center justify-center">
            {capaImage ? <img src={capaImage} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center opacity-20"><Camera size={48} /><p className="font-black">ADICIONAR CAPA</p></div>}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {diasSemana.map(d => <div key={d} className="text-center font-black opacity-20 text-xs uppercase">{d}</div>)}
          {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={i} />)}
          {Array.from({ length: diasNoMes }, (_, i) => {
            const dia = i + 1;
            const key = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const evs = eventos.filter(e => e.perfil === perfilAtivo?.nome && isDiaNoPeriodo(key, e.dataInicio, e.dataFim));
            return (
              <div key={dia} onClick={() => { setTempEvento({...tempEvento, id:'', dataInicio:key, dataTermino:key, perfil:perfilAtivo.nome, chatId:perfilAtivo.chatId, titulo:'', conteudoSecundario:'', linkDrive:''}); setShowEventModal(true); }} className={`h-32 border-2 border-black rounded-[30px] p-4 cursor-pointer shadow-sm transition-all hover:scale-105 ${dataAtiva.getDate() === dia ? 'bg-orange-50' : 'bg-white'}`}>
                <span className="text-2xl font-black">{dia}</span>
                <div className="flex gap-1 mt-2 flex-wrap">
                    {evs.map((ev, idx) => <div key={idx} onClick={(e) => { e.stopPropagation(); setTempEvento({...ev, dataInicio:ev.dataInicio.split(' ')[0], dataTermino:ev.dataFim.split(' ')[0], horaInicio:ev.dataInicio.split(' ')[1] || '08:00', horaFim:ev.dataFim.split(' ')[1] || '09:00'}); setShowEventModal(true); }} className="w-3 h-3 rounded-full border border-black cursor-pointer hover:scale-125 transition-transform" style={{ backgroundColor: ev.cor }} />)}
                </div>
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
                <input value={tempEvento.titulo} onChange={e => setTempEvento({...tempEvento, titulo: e.target.value})} className="w-full text-4xl font-black border-b-2 border-black outline-none uppercase py-2" placeholder="CONTEÚDO" />
                <textarea value={tempEvento.conteudoSecundario} onChange={e => setTempEvento({...tempEvento, conteudoSecundario: e.target.value})} className="w-full h-24 border-2 border-black rounded-xl p-4 font-bold outline-none resize-none" placeholder="Descrição..." />
                <div className="grid grid-cols-2 gap-6"><div className="border-2 border-black p-4 rounded-2xl bg-[#ffce0a]/10"><p className="text-[9px] font-black uppercase opacity-40">ChatId</p><p className="font-mono text-xs">{tempEvento.chatId}</p></div><div className="border-2 border-black p-4 rounded-2xl bg-white"><p className="text-[9px] font-black uppercase opacity-40">Drive</p><input value={tempEvento.linkDrive} onChange={e => setTempEvento({...tempEvento, linkDrive: e.target.value})} className="w-full font-bold text-xs outline-none bg-transparent" /></div></div>
                <div className="flex justify-between items-center pt-8 border-t-2 border-black font-black uppercase text-2xl">
                    <div className="flex gap-8">
                        <button onClick={handleSalvarEvento} className="hover:underline decoration-[#ffce0a] decoration-[12px]">Gravar</button>
                        {tempEvento.id && <button onClick={handleExcluirEvento} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={24}/></button>}
                    </div>
                    <button onClick={async () => { const destino = tempEvento.chatId || perfilAtivo?.chatId; setEnviandoZap(true); await fetch('/api/whatsapp/send', { method: 'POST', body: JSON.stringify({...tempEvento, responsavelChatId: destino, nome: perfilAtivo.nome}) }); setEnviandoZap(false); alert("🚀 Enviado!"); }} className="text-[#1260c7] hover:underline">Disparar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-2 border-black rounded-[40px] p-10 w-full max-w-md shadow-2xl relative">
              <X className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowPerfilModal(false)} />
              <h2 className="text-3xl font-black uppercase mb-8 border-b-2 border-black">Perfil</h2>
              <div className="space-y-6 font-black uppercase text-xs">
                <div><p className="mb-1">Nome</p><input value={perfilAtivo?.nome || ''} onChange={e => setPerfilAtivo({...perfilAtivo, nome: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl outline-none" /></div>
                <div><p className="mb-1">WhatsApp ChatID</p><input value={perfilAtivo?.chatId || ''} onChange={e => setPerfilAtivo({...perfilAtivo, chatId: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl outline-none" /></div>
                <button onClick={handleSalvarPerfil} className="w-full bg-black text-white p-5 rounded-2xl shadow-[4px_4px_0_#ffce0a] active:translate-y-1">Gravar na Planilha</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style jsx global>{` .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; } .no-scrollbar::-webkit-scrollbar { display: none; } `}</style>
    </div>
  );
}
