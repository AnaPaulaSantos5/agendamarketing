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
  const [showSidebar, setShowSidebar] = useState(true); // CONTROLE DA SIDEBAR
  const [capaImage, setCapaImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempEvento, setTempEvento] = useState({ id: '', dataInicio: '', dataTermino: '', titulo: '', conteudoSecundario: '', linkDrive: '', cor: CORES_PASTEL[0], perfil: '', chatId: '', tipo: 'externo', horaInicio: '08:00', horaFim: '09:00' });

  const carregarDados = async () => {
    try {
      const res = await fetch('/api/agenda', { cache: 'no-store' });
      const data = await res.json();
      if (data.events) setEventos(data.events);
      if (data.perfis) setPerfis(data.perfis);
      if (data.feed) setFeed(data.feed);
      if (data.perfis && !perfilAtivo) {
          const logado = data.perfis.find((p: any) => p.email?.toLowerCase() === session?.user?.email?.toLowerCase());
          setPerfilAtivo(logado || data.perfis[0]);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/login"); return; }
    const savedCapa = localStorage.getItem('agenda_capa_marketing');
    if (savedCapa) setCapaImage(savedCapa);
    if (status === "authenticated") { carregarDados(); const interval = setInterval(carregarDados, 15000); return () => clearInterval(interval); }
  }, [status]);

  const handleSalvarPerfil = async () => {
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify({ isPerfilUpdate: true, email: perfilAtivo.email, nome: perfilAtivo.nome, chatId: perfilAtivo.chatId }) });
    if (res.ok) { alert("Perfil Atualizado!"); setShowPerfilModal(false); carregarDados(); }
  };

  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const primeiroDiaSemana = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), 1).getDay(), [dataAtiva]);
  const diasNoMes = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 0).getDate(), [dataAtiva]);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      {/* SIDEBAR RETRÁTIL COM ANIMAÇÃO */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-r-2 border-black p-6 bg-gray-50 flex flex-col h-full overflow-hidden relative z-50">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2"><BellRing size={24} className="text-[#1260c7]" /> Atividade</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar custom-scrollbar">
              {feed.map((item, idx) => (
                <div key={idx} className="bg-white border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_black]">
                  <p className="font-black text-[10px] uppercase truncate">{item.Nome}</p>
                  <p className="text-[9px] font-bold opacity-70 mt-1 italic">
                    {item.Tipo === 'RESPOSTA' ? (item.Resposta === 'SIM' ? 'Ana Paula está de acordo' : 'De acordo') : `🚀 ${item.Evento}`}
                  </p>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white relative">
        {/* BOTÃO PARA PUXAR/RETIRAR SIDEBAR */}
        <button onClick={() => setShowSidebar(!showSidebar)} className="absolute top-4 left-4 z-[100] bg-white border-2 border-black p-2 rounded-xl shadow-md hover:bg-black hover:text-white transition-all"><Menu size={20}/></button>

        {/* HEADER AREA: Z-30 PARA FICAR ACIMA DA CAPA */}
        <div className="relative z-30 flex items-center justify-between mb-6 h-20 ml-12">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-black bg-white flex items-center justify-center text-4xl font-black shadow-[4px_4px_0px_black] uppercase overflow-hidden">{perfilAtivo?.nome?.charAt(0)}</div>
                    <button onClick={() => setShowPerfilModal(true)} className="absolute -top-1 -left-1 bg-white border-2 border-black rounded-full p-2 hover:bg-black hover:text-white shadow-md"><Settings size={18} /></button>
                </div>
                <div className="relative">
                    <div onClick={() => setShowPerfilSelector(!showPerfilSelector)} className="bg-white border-2 border-black px-6 py-2 rounded-2xl flex items-center gap-4 cursor-pointer shadow-[4px_4px_0px_black]">
                        <div><h3 className="text-xl font-black uppercase leading-none">{perfilAtivo?.nome || "Perfil"}</h3><p className="text-[9px] font-bold opacity-40 uppercase">{perfilAtivo?.email}</p></div>
                        <ChevronDown className={`transition-transform ${showPerfilSelector ? 'rotate-180' : ''}`} />
                    </div>
                    {showPerfilSelector && (
                        <div className="absolute top-full left-0 mt-2 w-full bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_black] overflow-hidden z-[100]">
                            {perfis.map(p => (
                                <div key={p.email} onClick={() => { setPerfilAtivo(p); setShowPerfilSelector(false); }} className="p-4 hover:bg-gray-100 cursor-pointer font-black uppercase text-xs border-b border-black last:border-0">{p.nome}</div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <button onClick={() => signOut()} className="bg-white border-2 border-black p-4 rounded-2xl font-black uppercase text-xs shadow-[4px_4px_0px_black] hover:bg-red-500 hover:text-white">Sair</button>
        </div>

        {/* CAPA: Z-0 PARA NÃO ATRAPALHAR CLIQUES NO HEADER */}
        <div className="relative mb-10 h-64 rounded-[40px] border-2 border-black overflow-hidden bg-gray-100 z-0 shadow-[8px_8px_0px_black]">
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onloadend = () => { setCapaImage(r.result as string); localStorage.setItem('agenda_capa_marketing', r.result as string); }; r.readAsDataURL(file); } }} />
          <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer flex items-center justify-center">
            {capaImage ? <img src={capaImage} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center opacity-20"><Camera size={48} /><p className="font-black">ADICIONAR CAPA</p></div>}
          </div>
        </div>

        {/* CALENDÁRIO GRID FILTRADO PELO PERFIL ATIVO */}
        <div className="grid grid-cols-7 gap-4">
          {diasSemana.map(d => <div key={d} className="text-center font-black opacity-20 text-xs uppercase">{d}</div>)}
          {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={i} />)}
          {Array.from({ length: diasNoMes }, (_, i) => {
            const dia = i + 1;
            const key = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const evs = eventos.filter(e => e.perfil === perfilAtivo?.nome && e.dataInicio?.split(' ')[0] === key);
            return (
              <div key={dia} onClick={() => { setTempEvento({...tempEvento, id:'', dataInicio:key, dataTermino:key, perfil:perfilAtivo.nome, chatId:perfilAtivo.chatId}); setShowEventModal(true); }} className={`h-32 border-2 border-black rounded-[30px] p-4 cursor-pointer shadow-sm ${dataAtiva.getDate() === dia ? 'bg-orange-50' : 'bg-white'}`}>
                <span className="text-2xl font-black">{dia}</span>
                <div className="flex gap-1 mt-2 flex-wrap">
                    {evs.map((ev, idx) => <div key={idx} className="w-3 h-3 rounded-full border border-black" style={{ backgroundColor: ev.cor }} />)}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL PERFIL ADMIN */}
      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-2 border-black rounded-[40px] p-10 w-full max-w-md shadow-[12px_12px_0px_black]">
              <X className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowPerfilModal(false)} />
              <h2 className="text-3xl font-black uppercase mb-8 border-b-2 border-black pb-2">Perfil Admin</h2>
              <div className="space-y-6 font-black uppercase text-xs">
                <div><p className="mb-1">Nome</p><input value={perfilAtivo?.nome || ''} onChange={e => setPerfilAtivo({...perfilAtivo, nome: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl outline-none" /></div>
                <div><p className="mb-1">WhatsApp ChatID</p><input value={perfilAtivo?.chatId || ''} onChange={e => setPerfilAtivo({...perfilAtivo, chatId: e.target.value})} className="w-full border-2 border-black p-4 rounded-xl outline-none" /></div>
                <button onClick={handleSalvarPerfil} className="w-full bg-black text-white p-5 rounded-2xl shadow-[4px_4px_0px_#ffce0a] active:translate-y-1">Gravar na Planilha</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
