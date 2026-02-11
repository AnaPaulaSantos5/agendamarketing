"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Trash2, LogOut, Send, CheckCircle2, Plus, BellRing, Camera, Menu, UserCog } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CORES_PASTEL = ['#f5886c', '#1260c7', '#ffce0a', '#b8e1dd', '#d1c4e9', '#f8bbd0', '#e1f5fe', '#c5e1a5', '#ffe082'];

export default function AgendaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [perfilAtivo, setPerfilAtivo] = useState<any>(null);
  const [perfilSendoEditado, setPerfilSendoEditado] = useState<any>(null);
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
  }, [status]);

  const handleSalvarPerfilAdmin = async () => {
    const res = await fetch('/api/agenda', { 
        method: 'POST', 
        body: JSON.stringify({ isPerfilUpdate: true, email: perfilSendoEditado.email, nome: perfilSendoEditado.nome, chatId: perfilSendoEditado.chatId }) 
    });
    if (res.ok) { alert("Perfil atualizado na planilha!"); setShowPerfilModal(false); carregarDados(); }
  };

  const handleSalvarEvento = async () => {
    const payload = { ...tempEvento, dataInicio: `${tempEvento.dataInicio} ${tempEvento.horaInicio}`, dataFim: `${tempEvento.dataTermino} ${tempEvento.horaFim}`, chatId: tempEvento.chatId || perfilAtivo.chatId };
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) { setShowEventModal(false); carregarDados(); }
  };

  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const diasNoMes = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 0).getDate(), [dataAtiva]);
  const primeiroDiaSemana = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), 1).getDay(), [dataAtiva]);

  // Filtra eventos para mostrar apenas os do perfil que o Admin selecionou no topo
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => e.perfil === perfilAtivo?.nome);
  }, [eventos, perfilAtivo]);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden">
      <AnimatePresence>
        {showSidebar && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-r-4 border-black p-6 bg-gray-50 flex flex-col h-full overflow-hidden relative">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2"><BellRing size={24} className="text-[#1260c7]" /> Atividade</h2>
            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar custom-scrollbar">
              {feed.map((item, idx) => (
                <div key={idx} className="bg-white border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_black]">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border border-black text-white ${item.Tipo === 'ENVIO' ? 'bg-[#1260c7]' : 'bg-[#22c55e]'}`}>{item.Tipo}</span>
                    <span className="text-[8px] font-bold opacity-30">{item.Data?.split(',')[1]}</span>
                  </div>
                  <p className="font-black text-xs uppercase truncate">{item.Nome}</p>
                  <p className="text-[10px] opacity-70 mt-1 font-bold italic truncate">{item.Evento || (item.Resposta === 'SIM' ? 'Precisa de ajuda' : 'Está de acordo')}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-8 no-scrollbar bg-white relative">
        <button onClick={() => setShowSidebar(!showSidebar)} className="absolute top-4 left-4 z-[100] bg-white border-2 border-black p-2 rounded-xl shadow-md"><Menu size={20}/></button>
        
        {/* HEADER COM SELETOR DE PERFIL REAL */}
        <div className="relative mb-10 h-72 rounded-[40px] border-4 border-black bg-gray-100 flex items-end p-8 shadow-[8px_8px_0px_black] overflow-visible">
           {capaImage && <img src={capaImage} className="absolute inset-0 w-full h-full object-cover rounded-[36px]" alt="Capa" />}
           <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f){ const r=new FileReader(); r.onloadend=()=>{ localStorage.setItem('agenda_capa_marketing', r.result as string); setCapaImage(r.result as string); }; r.readAsDataURL(f); } }} />
           <button onClick={() => fileInputRef.current?.click()} className="absolute top-6 right-6 bg-white border-2 border-black p-2 rounded-full z-20 hover:scale-110 transition-transform"><Camera size={18}/></button>
           
           <div className="relative z-10 flex justify-between w-full items-center">
              <div className="relative">
                {/* BOTÃO DO SELETOR */}
                <div onClick={() => setShowPerfilSelector(!showPerfilSelector)} className="flex items-center gap-4 cursor-pointer bg-white border-4 border-black p-2 pr-6 rounded-2xl shadow-[6px_6px_0px_black] active:translate-y-1 active:shadow-none transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#1260c7] text-white flex items-center justify-center font-black border-2 border-black uppercase text-xl">{perfilAtivo?.nome?.charAt(0)}</div>
                    <div><p className="text-[10px] font-black opacity-40 uppercase leading-none">Calendário de:</p><p className="font-black uppercase text-sm">{perfilAtivo?.nome}</p></div>
                    <ChevronDown size={20} className={showPerfilSelector ? 'rotate-180' : ''} />
                </div>
                {/* LISTA DE PERFIS PARA O ADMIN */}
                <AnimatePresence>
                    {showPerfilSelector && (
                        <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="absolute top-full left-0 mt-4 w-72 bg-white border-4 border-black rounded-2xl shadow-[10px_10px_0px_black] z-[100] overflow-hidden font-black">
                            {perfis.map((p, i) => (
                                <div key={i} onClick={() => { setPerfilAtivo(p); setShowPerfilSelector(false); }} className="p-4 border-b-2 border-black hover:bg-blue-50 cursor-pointer flex justify-between items-center group uppercase text-xs">
                                    <span>{p.nome}</span>
                                    <button onClick={(e) => { e.stopPropagation(); setPerfilSendoEditado(p); setShowPerfilModal(true); setShowPerfilSelector(false); }} className="opacity-20 group-hover:opacity-100 hover:text-[#1260c7] transition-all">
                                        <UserCog size={18} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>
              <button onClick={() => signOut()} className="bg-white border-4 border-black px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-[6px_6px_0px_black] hover:bg-red-500 hover:text-white transition-all">Sair</button>
           </div>
        </div>

        {/* CALENDÁRIO GRID (MOSTRANDO EVENTOS DO PERFIL ATIVO) */}
        <div className="grid grid-cols-7 gap-4">
          {diasSemana.map(d => <div key={d} className="text-center font-black opacity-20 text-xs uppercase">{d}</div>)}
          {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={i} />)}
          {Array.from({ length: diasNoMes }, (_, i) => {
            const dia = i + 1;
            const key = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const evs = eventosFiltrados.filter(e => e.dataInicio?.split(' ')[0] === key);
            return (
              <div key={dia} onClick={() => { setTempEvento({...tempEvento, id:'', dataInicio:key, dataTermino:key, perfil:perfilAtivo.nome, chatId:perfilAtivo.chatId, titulo:'', conteudoSecundario:''}); setShowEventModal(true); }} className={`h-32 border-4 border-black rounded-[30px] p-4 cursor-pointer transition-all hover:scale-105 ${dataAtiva.getDate() === dia && dataAtiva.getMonth() === new Date().getMonth() ? 'bg-orange-50 shadow-[4px_4px_0px_black]' : 'bg-white'}`}>
                <span className="text-2xl font-black">{dia}</span>
                <div className="flex gap-1 mt-2 flex-wrap">{evs.map((ev, idx) => <div key={idx} onClick={(e) => { e.stopPropagation(); setTempEvento({...ev, dataInicio:ev.dataInicio.split(' ')[0], dataTermino:ev.dataFim.split(' ')[0], horaInicio:ev.dataInicio.split(' ')[1], horaFim:ev.dataFim.split(' ')[1]}); setShowEventModal(true); }} className="w-3 h-3 rounded-full border border-black shadow-sm" style={{ backgroundColor: ev.cor }} />)}</div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL EVENTO */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white border-4 border-black rounded-[50px] p-10 w-full max-w-3xl shadow-[15px_15px_0px_black] max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between mb-8 border-b-4 border-black pb-4"><h2 className="text-4xl font-black uppercase">Evento</h2><X className="cursor-pointer" onClick={() => setShowEventModal(false)} /></div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <select value={tempEvento.perfil} onChange={e => { const p = perfis.find(it => it.nome === e.target.value); setTempEvento({...tempEvento, perfil: e.target.value, chatId: p?.chatId || ''}); }} className="border-4 border-black rounded-2xl p-4 font-black bg-gray-50 uppercase">{perfis.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}</select>
                  <div className="flex border-4 border-black rounded-2xl overflow-hidden font-black text-xs h-[64px]"><button onClick={() => setTempEvento({...tempEvento, tipo: 'externo'})} className={`flex-1 ${tempEvento.tipo === 'externo' ? 'bg-[#1260c7] text-white' : 'bg-white'}`}>EXTERNO</button><button onClick={() => setTempEvento({...tempEvento, tipo: 'interno'})} className={`flex-1 ${tempEvento.tipo === 'interno' ? 'bg-black text-white' : 'bg-white'}`}>INTERNO</button></div>
                </div>
                <div className="bg-gray-50 p-8 rounded-[40px] border-4 border-black grid grid-cols-2 gap-8">
                  <div className="space-y-4"><p className="text-[10px] font-black uppercase opacity-30 flex items-center gap-1"><CalendarIcon size={12}/> Início</p><input type="date" value={tempEvento.dataInicio} onChange={e => setTempEvento({...tempEvento, dataInicio: e.target.value})} className="text-xl font-black bg-transparent w-full border-b-2 border-black outline-none" /><input type="time" value={tempEvento.horaInicio} onChange={e => setTempEvento({...tempEvento, horaInicio: e.target.value})} className="text-3xl font-black bg-transparent w-full outline-none" /></div>
                  <div className="space-y-4"><p className="text-[10px] font-black uppercase opacity-30 flex items-center gap-1"><CalendarIcon size={12}/> Término</p><input type="date" value={tempEvento.dataTermino} onChange={e => setTempEvento({...tempEvento, dataTermino: e.target.value})} className="text-xl font-black bg-transparent w-full border-b-2 border-black outline-none" /><input type="time" value={tempEvento.horaFim} onChange={e => setTempEvento({...tempEvento, horaFim: e.target.value})} className="text-3xl font-black bg-transparent w-full outline-none" /></div>
                </div>
                <input value={tempEvento.titulo} onChange={e => setTempEvento({...tempEvento, titulo: e.target.value})} className="w-full text-4xl font-black border-b-4 border-black outline-none uppercase py-2" placeholder="CONTEÚDO" />
                <textarea value={tempEvento.conteudoSecundario} onChange={e => setTempEvento({...tempEvento, conteudoSecundario: e.target.value})} className="w-full h-24 border-4 border-black rounded-2xl p-4 font-black outline-none resize-none" placeholder="Descrição..." />
                <div className="flex justify-between items-center pt-8 border-t-4 border-black font-black uppercase text-2xl">
                    <button onClick={handleSalvarEvento} className="hover:underline text-[#1260c7]">GRAVAR</button>
                    <button onClick={async () => { const d = tempEvento.chatId || perfilAtivo.chatId; await fetch('/api/whatsapp/send', { method: 'POST', body: JSON.stringify({ ...tempEvento, responsavelChatId: d, nome: perfilAtivo.nome }) }); alert("🚀 Enviado!"); }} className="text-green-600 hover:underline">DISPARAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GESTÃO DE PERFIL (EDITA QUALQUER UM QUE O ADMIN CLICAR) */}
      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-4 border-black p-10 rounded-[40px] w-full max-w-md shadow-[20px_20px_0px_black] relative">
              <X className="absolute top-8 right-8 cursor-pointer" onClick={() => setShowPerfilModal(false)} />
              <h2 className="text-4xl font-black uppercase mb-8 border-b-4 border-black pb-2">Editar Perfil</h2>
              <div className="space-y-6 font-black uppercase text-xs">
                <div><p className="mb-1 opacity-40">Nome na Planilha</p><input value={perfilSendoEditado?.nome || ''} onChange={e => setPerfilSendoEditado({...perfilSendoEditado, nome: e.target.value})} className="w-full border-4 border-black p-4 rounded-xl outline-none" /></div>
                <div><p className="mb-1 opacity-40">WhatsApp ChatID</p><input value={perfilSendoEditado?.chatId || ''} onChange={e => setPerfilSendoEditado({...perfilSendoEditado, chatId: e.target.value})} className="w-full border-4 border-black p-4 rounded-xl outline-none" /></div>
                <div className="bg-gray-100 p-4 rounded-xl opacity-50"><p className="mb-1 text-[8px]">E-mail (Chave da Planilha)</p><p>{perfilSendoEditado?.email}</p></div>
                <button onClick={handleSalvarPerfilAdmin} className="w-full bg-black text-white p-5 rounded-2xl shadow-[6px_6px_0px_#ffce0a] active:translate-y-1">Gravar Alterações</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
