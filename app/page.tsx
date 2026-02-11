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
  }, [status, session]);

  const handleSalvarPerfil = async () => {
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify({ isPerfilUpdate: true, email: perfilAtivo.email, nome: perfilAtivo.nome, chatId: perfilAtivo.chatId }) });
    if (res.ok) { alert("Perfil Admin Atualizado!"); setShowPerfilModal(false); carregarDados(); }
  };

  const handleSalvar = async () => {
    const payload = { ...tempEvento, dataInicio: `${tempEvento.dataInicio} ${tempEvento.horaInicio}`, dataFim: `${tempEvento.dataTermino} ${tempEvento.horaFim}`, chatId: tempEvento.chatId || perfilAtivo.chatId };
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
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-r-2 border-black p-6 bg-gray-50 flex flex-col h-full overflow-hidden relative z-[60]">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2"><BellRing size={24} className="text-[#1260c7]" /> Atividade</h2>
            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar custom-scrollbar">
              {feed.map((item, idx) => (
                <div key={idx} className="bg-white border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_black]">
                  <p className="font-black text-xs uppercase truncate">{item.Nome}</p>
                  <p className="text-[10px] opacity-70 mt-1 font-bold italic">{item.Tipo === 'RESPOSTA' ? (item.Resposta === 'SIM' ? `${item.Nome} está de acordo` : 'De acordo') : `🚀 ${item.Evento}`}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white relative">
        <button onClick={() => setShowSidebar(!showSidebar)} className="absolute top-4 left-4 z-[100] bg-white border-2 border-black p-2 rounded-xl shadow-md"><Menu size={20}/></button>

        {/* CONTAINER DA CAPA COM Z-INDEX AJUSTADO */}
        <div className="relative mb-10 h-72 rounded-[40px] border-2 border-black flex items-end p-8 z-10 overflow-visible">
          {/* A Imagem de fundo fica atrás de tudo no container */}
          <div className="absolute inset-0 z-0 rounded-[38px] overflow-hidden bg-gray-50 flex items-center justify-center text-gray-400 font-bold cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => { localStorage.setItem('agenda_capa_marketing', r.result as string); setCapaImage(r.result as string); }; r.readAsDataURL(file); } }} />
            {capaImage ? <img src={capaImage} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center"><Camera size={40}/><p>ADICIONAR CAPA</p></div>}
          </div>
          
          {/* OS ELEMENTOS DE PERFIL GANHAM Z-50 PARA FLUTUAR SOBRE A IMAGEM */}
          <div className="relative z-50 flex items-center justify-between w-full pointer-events-none">
            <div className="flex items-center gap-6 pointer-events-auto">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-black bg-white flex items-center justify-center text-4xl font-black shadow-lg uppercase overflow-hidden">
                    {session?.user?.image ? <img src={session.user.image} className="w-full h-full object-cover" /> : (perfilAtivo?.nome?.charAt(0) || 'A')}
                </div>
                <button onClick={() => setShowPerfilModal(true)} className="absolute -top-1 -left-1 bg-white border-2 border-black rounded-full p-2 hover:bg-black hover:text-white transition-all shadow-md"><Settings size={18} /></button>
              </div>
              <div className="relative">
                <div className="bg-white border-2 border-black px-6 py-2 rounded-2xl flex items-center gap-4 cursor-pointer shadow-md" onClick={() => setShowPerfilSelector(!showPerfilSelector)}>
                  <div><h3 className="text-xl font-black uppercase leading-none">{perfilAtivo?.nome || "Perfil"}</h3><p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">{perfilAtivo?.email}</p></div>
                  <ChevronDown className={`opacity-40 transition-transform ${showPerfilSelector ? 'rotate-180' : ''}`} />
                </div>
                {showPerfilSelector && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-black rounded-2xl shadow-xl z-[200] overflow-hidden">
                        {perfis.map(p => (
                            <div key={p.email} onClick={() => { setPerfilAtivo(p); setShowPerfilSelector(false); }} className="p-4 hover:bg-gray-100 cursor-pointer font-black uppercase text-xs border-b border-black last:border-0">{p.nome}</div>
                        ))}
                    </div>
                )}
              </div>
            </div>
            <button onClick={() => signOut()} className="bg-white border-2 border-black p-4 rounded-2xl font-bold uppercase text-xs shadow-md pointer-events-auto hover:bg-red-500 hover:text-white transition-colors">Sair</button>
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
              <div key={dia} onClick={() => { setTempEvento({...tempEvento, id:'', dataInicio:key, dataTermino:key, perfil:perfilAtivo.nome, chatId:perfilAtivo.chatId, titulo: '', conteudoSecundario: ''}); setShowEventModal(true); }} className={`h-32 border-2 border-black rounded-[30px] p-4 cursor-pointer transition-all hover:scale-105 ${dataAtiva.getDate() === dia && dataAtiva.getMonth() === new Date().getMonth() ? 'bg-orange-50' : 'bg-white'}`}>
                <span className="text-2xl font-black">{dia}</span>
                <div className="flex gap-1 mt-2 flex-wrap">{evs.map((ev, idx) => <div key={idx} className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: ev.cor }} />)}</div>
              </div>
            );
          })}
        </div>
      </main>

      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-2 border-black rounded-[50px] p-12 w-full max-w-xl shadow-2xl relative">
              <X className="absolute top-8 right-8 cursor-pointer" onClick={() => setShowPerfilModal(false)} />
              <h2 className="text-4xl font-black uppercase mb-8 border-b-2 border-black pb-4">Gestão Admin</h2>
              <div className="space-y-6 font-black text-xs">
                <div><p className="mb-2 uppercase opacity-40">Nome do Perfil</p><input value={perfilAtivo?.nome || ''} onChange={e => setPerfilAtivo({...perfilAtivo, nome: e.target.value})} className="w-full border-2 border-black rounded-2xl p-4 font-black uppercase outline-none focus:bg-blue-50" /></div>
                <div><p className="mb-2 uppercase opacity-40">WhatsApp ChatID</p><input value={perfilAtivo?.chatId || ''} onChange={e => setPerfilAtivo({...perfilAtivo, chatId: e.target.value})} className="w-full border-2 border-black rounded-2xl p-4 font-black outline-none focus:bg-blue-50" /></div>
                <button onClick={handleSalvarPerfil} className="w-full bg-black text-white p-5 rounded-3xl font-black uppercase shadow-[6px_6px_0px_#ffce0a] active:translate-y-1 mt-4">Gravar na Planilha</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
