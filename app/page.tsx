"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Trash2, LogOut, Send, CheckCircle2, Plus, BellRing } from 'lucide-react';
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
  const [capaImage, setCapaImage] = useState<string | null>(null);
  const [enviandoZap, setEnviandoZap] = useState(false);
  const [eventosDoDiaSelecionado, setEventosDoDiaSelecionado] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempEvento, setTempEvento] = useState({
    id: '', dataInicio: '', dataTermino: '', titulo: '', conteudoSecundario: '', 
    linkDrive: '', cor: CORES_PASTEL[0], perfil: '', chatId: '', tipo: 'externo',
    horaInicio: '08:00', horaFim: '09:00'
  });

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
    if (status === "authenticated") {
        carregarDados();
        const interval = setInterval(carregarDados, 15000); 
        return () => clearInterval(interval);
    }
  }, [status, session, router]);

  const handleSalvar = async () => {
    const payload = { ...tempEvento, dataInicio: `${tempEvento.dataInicio} ${tempEvento.horaInicio}`, dataFim: `${tempEvento.dataTermino} ${tempEvento.horaFim}` };
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) { setShowEventModal(false); carregarDados(); }
  };

  const handleSalvarPerfil = async () => {
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify({ isPerfilUpdate: true, email: perfilAtivo.email, nome: perfilAtivo.nome, chatId: perfilAtivo.chatId }) });
    if (res.ok) { alert("Perfil Salvo!"); setShowPerfilModal(false); carregarDados(); }
  };

  const handleDispararWhatsApp = async () => {
    setEnviandoZap(true);
    try {
      await fetch('/api/whatsapp/send', { method: 'POST', body: JSON.stringify({ responsavelChatId: tempEvento.chatId || perfilAtivo.chatId, conteudoPrincipal: tempEvento.titulo, conteudoSecundario: tempEvento.conteudoSecundario }) });
      alert("🚀 Enviado!");
    } catch (e) { console.error(e); } finally { setEnviandoZap(false); }
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
      <aside className="w-80 border-r-2 border-black p-6 bg-gray-50 flex flex-col h-full overflow-hidden">
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2"><BellRing size={24} className="text-[#1260c7]" /> Atividade</h2>
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar custom-scrollbar">
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
      </aside>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white relative">
        <div className="relative mb-10 h-72 rounded-[40px] border-2 border-black overflow-hidden flex items-end p-8">
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => { localStorage.setItem('agenda_capa_marketing', r.result as string); setCapaImage(r.result as string); }; r.readAsDataURL(file); } }} />
          <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer z-0 bg-gray-50 flex items-center justify-center text-gray-400 font-bold">{capaImage ? <img src={capaImage} className="w-full h-full object-cover" alt="Capa" /> : "Adicionar Capa"}</div>
          <div className="relative z-10 flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-black bg-white flex items-center justify-center text-4xl font-black shadow-lg uppercase overflow-hidden">{perfilAtivo?.nome?.charAt(0) || 'A'}</div>
                <button onClick={() => setShowPerfilModal(true)} className="absolute -top-1 -left-1 bg-white border-2 border-black rounded-full p-2 hover:bg-black hover:text-white transition-all shadow-md"><Settings size={18} /></button>
              </div>
              <div className="bg-white border-2 border-black px-6 py-2 rounded-2xl flex items-center gap-4 cursor-pointer shadow-md" onClick={() => setShowPerfilSelector(!showPerfilSelector)}>
                <div><h3 className="text-xl font-black uppercase leading-none">{perfilAtivo?.nome || "Perfil"}</h3><p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{session?.user?.email}</p></div>
                <ChevronDown className="opacity-40" />
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/login' })} className="bg-white border-2 border-black p-4 rounded-2xl hover:bg-red-50 flex items-center gap-2 font-bold uppercase text-xs shadow-md"><LogOut size={18} /> Sair</button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
          <div className="flex items-center gap-4">
            <ChevronLeft size={60} className="cursor-pointer" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() - 1, 1))} />
            <h1 className="text-8xl font-black uppercase tracking-tighter leading-none">{meses[dataAtiva.getMonth()]}</h1>
            <h1 className="text-8xl font-light tracking-tighter leading-none ml-4">{dataAtiva.getFullYear()}</h1>
            <ChevronRight size={60} className="cursor-pointer" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 1))} />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-4">
          {diasSemana.map(d => <div key={d} className="text-center font-black opacity-20 text-xs uppercase">{d}</div>)}
          {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={i} />)}
          {Array.from({ length: diasNoMes }, (_, i) => {
            const dia = i + 1;
            const key = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const evs = eventos.filter(e => isDiaNoPeriodo(key, e.dataInicio?.split(' ')[0], e.dataFim?.split(' ')[0]));
            return (
              <div key={dia} onClick={() => {
                const dataStr = key;
                setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), dia));
                setTempEvento({ ...tempEvento, id: '', dataInicio: dataStr, dataTermino: dataStr, titulo: '', perfil: perfilAtivo?.nome || '', chatId: perfilAtivo?.chatId || '' });
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
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} exit={{ y: 50 }} className="bg-white border-2 border-black rounded-[60px] p-12 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                <h2 className="text-4xl font-black uppercase leading-none">Evento</h2>
                <X className="cursor-pointer" onClick={() => setShowEventModal(false)} />
              </div>
              <div className="space-y-6">
                <input value={tempEvento.titulo} onChange={e => setTempEvento({...tempEvento, titulo: e.target.value})} className="w-full text-4xl font-black bg-transparent outline-none uppercase border-b-2 border-black/10 py-2" placeholder="TÍTULO" />
                <textarea value={tempEvento.conteudoSecundario} onChange={e => setTempEvento({...tempEvento, conteudoSecundario: e.target.value})} className="w-full text-xl font-bold bg-transparent outline-none h-24 resize-none" placeholder="Descrição..." />
                <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={tempEvento.dataInicio} onChange={e => setTempEvento({...tempEvento, dataInicio: e.target.value})} className="border-2 border-black rounded-xl p-4 font-bold" />
                    <input type="time" value={tempEvento.horaInicio} onChange={e => setTempEvento({...tempEvento, horaInicio: e.target.value})} className="border-2 border-black rounded-xl p-4 font-bold" />
                </div>
                <div className="flex justify-between items-center pt-8 border-t-2 border-black font-black uppercase">
                  <button onClick={handleSalvar} className="hover:underline text-[#1260c7]">Gravar</button>
                  <button onClick={handleDispararWhatsApp} disabled={enviandoZap} className={`flex items-center gap-2 ${enviandoZap ? 'opacity-20' : ''}`}><Send size={24} /> Disparar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white border-4 border-black p-10 rounded-[40px] w-full max-w-md shadow-2xl">
              <h2 className="text-3xl font-black uppercase mb-8 border-b-2 border-black pb-4">Perfil</h2>
              <div className="space-y-6">
                <input value={perfilAtivo?.nome || ''} onChange={e => setPerfilAtivo({...perfilAtivo, nome: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-bold uppercase" placeholder="NOME" />
                <input value={perfilAtivo?.chatId || ''} onChange={e => setPerfilAtivo({...perfilAtivo, chatId: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl font-bold" placeholder="CHAT ID" />
                <button onClick={handleSalvarPerfil} className="w-full bg-black text-white p-5 rounded-3xl font-black uppercase">Salvar na Planilha</button>
                <button onClick={() => setShowPerfilModal(false)} className="w-full font-black uppercase opacity-40 text-xs">Cancelar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
