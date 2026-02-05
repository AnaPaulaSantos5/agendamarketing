"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Camera, Clock, Calendar as CalendarIcon, Trash2, Mail, MessageSquare, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CORES_PASTEL = ['#f5886c', '#1260c7', '#ffce0a', '#b8e1dd', '#d1c4e9', '#f8bbd0', '#e1f5fe', '#c5e1a5', '#ffe082'];

export default function AgendaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [eventos, setEventos] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [perfilAtivo, setPerfilAtivo] = useState<any>(null);
  const [dataAtiva, setDataAtiva] = useState(new Date(2026, 1, 4)); 
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPerfilSelector, setShowPerfilSelector] = useState(false);
  const [capaImage, setCapaImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempEvento, setTempEvento] = useState({
    id: '', dataInicio: '', dataTermino: '', titulo: '', conteudoSecundario: '', 
    linkDrive: '', cor: CORES_PASTEL[0], perfil: '', chatId: '', tipo: 'externo',
    horaInicio: '08:00', horaFim: '09:00'
  });

  // --- 1. PROTEÇÃO DE ROTA E CARREGAMENTO DE DADOS ---
  useEffect(() => {
    // Se não estiver logado, redireciona para o login IMEDIATAMENTE
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const carregarDados = async () => {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        if (data.events) setEventos(data.events);
        if (data.perfis) {
          setPerfis(data.perfis);
          // Sincroniza o perfil ativo com o e-mail do Google logado
          const logado = data.perfis.find((p: any) => p.email?.toLowerCase() === session?.user?.email?.toLowerCase());
          setPerfilAtivo(logado || data.perfis[0]);
        }
      } catch (e) { console.error("Erro ao carregar dados:", e); }
    };

    // Recupera a capa do localStorage (agora persistente)
    const savedCapa = localStorage.getItem('agenda_capa_marketing');
    if (savedCapa) setCapaImage(savedCapa);

    if (status === "authenticated") carregarDados();
  }, [status, session, router]);

  // --- 2. LÓGICA DO CALENDÁRIO ---
  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const diasNoMes = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 0).getDate(), [dataAtiva]);
  const primeiroDiaSemana = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), 1).getDay(), [dataAtiva]);

  const isDiaNoPeriodo = (diaCalendarioStr: string, dataInicioStr: string, dataFimStr: string) => {
    const dia = new Date(diaCalendarioStr + 'T00:00:00');
    const inicio = new Date(dataInicioStr + 'T00:00:00');
    const fim = new Date(dataFimStr + 'T00:00:00');
    return dia >= inicio && dia <= fim;
  };

  const handleDiaClick = (dia: number) => {
    const dataStr = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), dia));
    
    const existente = eventos.find(e => isDiaNoPeriodo(dataStr, e.dataInicio?.split(' ')[0], e.dataFim?.split(' ')[0]));
    
    if (existente) {
      setTempEvento({
        ...tempEvento, id: existente.id, titulo: existente.titulo,
        dataInicio: existente.dataInicio?.split(' ')[0],
        dataTermino: existente.dataFim?.split(' ')[0],
        cor: existente.cor, tipo: existente.tipo || 'externo',
        perfil: existente.perfil, chatId: existente.chatId
      });
    } else {
      setTempEvento({
        ...tempEvento, id: '', dataInicio: dataStr, dataTermino: dataStr, titulo: '',
        conteudoSecundario: '', perfil: perfilAtivo?.nome || '', chatId: perfilAtivo?.chatId || ''
      });
    }
    setShowEventModal(true);
  };

  const handleSalvar = async () => {
    const payload = {
      ...tempEvento,
      dataInicio: `${tempEvento.dataInicio} ${tempEvento.horaInicio}`,
      dataFim: `${tempEvento.dataTermino} ${tempEvento.horaFim}`,
    };
    const res = await fetch('/api/agenda', { method: 'POST', body: JSON.stringify(payload) });
    if (res.ok) { 
      setShowEventModal(false); 
      // Recarregamento suave sem perder estado
      const updated = await fetch('/api/agenda').then(r => r.json());
      setEventos(updated.events);
    }
  };

  // --- 3. RENDERS CONDICIONAIS ---
  if (status === "loading") {
    return (
      <div className="h-screen grid place-items-center bg-white font-black uppercase text-2xl">
        Sincronizando Agenda...
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="p-5 max-w-[1400px] mx-auto bg-white min-h-screen font-sans no-scrollbar">
      
      {/* CAPA PERSISTENTE */}
      <div className="relative mb-10 h-80 rounded-[40px] border-2 border-black overflow-hidden flex items-end p-8">
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const r = new FileReader();
            r.onloadend = () => {
              localStorage.setItem('agenda_capa_marketing', r.result as string);
              setCapaImage(r.result as string);
            };
            r.readAsDataURL(file);
          }
        }} />
        <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer z-0 bg-gray-50 flex items-center justify-center text-gray-400 font-bold">
          {capaImage ? <img src={capaImage} className="w-full h-full object-cover" /> : "Adicionar Capa"}
        </div>
        
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-black bg-white flex items-center justify-center text-4xl font-black shadow-lg uppercase overflow-hidden">
                {session?.user?.image ? <img src={session.user.image} alt="Perfil" /> : (perfilAtivo?.nome?.charAt(0) || 'A')}
              </div>
              <button onClick={() => setShowPerfilModal(true)} className="absolute -top-2 -left-2 bg-white border-2 border-black rounded-full p-2 hover:bg-black hover:text-white transition-all">
                <Settings size={20} />
              </button>
            </div>
            <div className="bg-white border-2 border-black px-6 py-2 rounded-2xl flex items-center gap-4 cursor-pointer" onClick={() => setShowPerfilSelector(!showPerfilSelector)}>
              <div>
                 <h3 className="text-2xl font-black uppercase leading-none">{perfilAtivo?.nome || "Perfil"}</h3>
                 <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{session?.user?.email}</p>
              </div>
              <ChevronDown className="opacity-40" />
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })} 
            className="bg-white border-2 border-black p-4 rounded-2xl hover:bg-red-50 flex items-center gap-2 font-bold uppercase text-xs"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>

        <AnimatePresence>
          {showPerfilSelector && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="absolute bottom-32 left-40 bg-white border-2 border-black rounded-2xl p-4 shadow-xl w-48 z-50">
              {perfis.map(p => (
                <div key={p.nome} onClick={() => { setPerfilAtivo(p); setShowPerfilSelector(false); }} className="p-2 hover:bg-gray-100 rounded-lg font-bold border-b last:border-0">{p.nome}</div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NAVEGAÇÃO - ANO NÍTIDO */}
      <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
        <div className="flex items-center gap-4">
          <ChevronLeft size={60} className="cursor-pointer hover:scale-110" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() - 1, 1))} />
          <h1 className="text-8xl font-black uppercase tracking-tighter leading-none">{meses[dataAtiva.getMonth()]}</h1>
        </div>
        <h1 className="text-8xl font-light text-black opacity-100 uppercase tracking-tighter leading-none">{dataAtiva.getFullYear()}</h1>
        <ChevronRight size={60} className="cursor-pointer hover:scale-110" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 1))} />
      </div>

      {/* CALENDÁRIO GRID */}
      <div className="grid grid-cols-7 gap-4">
        {diasSemana.map(d => <div key={d} className="text-center font-black opacity-20 text-xs uppercase">{d}</div>)}
        {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={i} />)}
        {Array.from({ length: diasNoMes }, (_, i) => {
          const dia = i + 1;
          const key = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          const eventosDoDia = eventos.filter(e => isDiaNoPeriodo(key, e.dataInicio?.split(' ')[0], e.dataFim?.split(' ')[0]));
          return (
            <div key={dia} onClick={() => handleDiaClick(dia)} className={`h-36 border-2 border-black rounded-[30px] p-4 cursor-pointer transition-all hover:scale-105 flex flex-col justify-between ${dataAtiva.getDate() === dia ? 'bg-orange-50' : 'bg-white'}`}>
              <span className="text-2xl font-black tracking-tighter">{dia}</span>
              <div className="flex gap-1 flex-wrap">
                {eventosDoDia.map((ev, idx) => (
                  <div key={idx} className="w-3 h-3 rounded-full border border-black shadow-sm" style={{ backgroundColor: ev.cor }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL PERFIL */}
      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-2 border-black rounded-[50px] p-12 w-full max-w-xl shadow-2xl relative">
              <X className="absolute top-8 right-8 cursor-pointer" onClick={() => setShowPerfilModal(false)} />
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-2 border-black pb-4">Configurar Perfil</h2>
              <div className="space-y-6">
                <div><p className="text-[10px] font-black uppercase opacity-30 mb-2">Nome</p><input readOnly value={perfilAtivo?.nome} className="w-full border-2 border-black rounded-2xl p-4 font-bold bg-gray-50 cursor-not-allowed" /></div>
                <div><p className="text-[10px] font-black uppercase opacity-30 mb-2">WhatsApp ChatID</p><div className="flex items-center gap-3 border-2 border-black rounded-2xl p-4 bg-gray-50"><MessageSquare size={20} className="opacity-30" /><input readOnly value={perfilAtivo?.chatId} className="w-full bg-transparent font-mono font-bold outline-none" /></div></div>
                <div><p className="text-[10px] font-black uppercase opacity-30 mb-2">Google E-mail</p><div className="flex items-center gap-3 border-2 border-black rounded-2xl p-4 bg-gray-50"><Mail size={20} className="opacity-30" /><input readOnly value={session?.user?.email || ""} className="w-full bg-transparent font-bold" /></div></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EVENTO */}
      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white border-2 border-black rounded-[60px] p-12 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{tempEvento.id ? 'Editar Registro' : 'Novo Registro'}</h2>
                <div className="flex gap-2">
                  {CORES_PASTEL.map(c => (
                    <div key={c} onClick={() => setTempEvento({...tempEvento, cor: c})} className={`w-7 h-7 rounded-full border-2 border-black cursor-pointer ${tempEvento.cor === c ? 'scale-125' : 'opacity-30'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <X className="cursor-pointer ml-4" onClick={() => setShowEventModal(false)} />
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <select value={tempEvento.perfil} onChange={e => {
                    const p = perfis.find(it => it.nome === e.target.value);
                    setTempEvento({...tempEvento, perfil: e.target.value, chatId: p?.chatId || ''});
                  }} className="border-2 border-black rounded-2xl p-4 font-bold bg-gray-50 outline-none uppercase">
                    {perfis.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
                  </select>
                  <div className="flex border-2 border-black rounded-2xl overflow-hidden font-black text-xs h-[60px]">
                    <button onClick={() => setTempEvento({...tempEvento, tipo: 'externo'})} className={`flex-1 ${tempEvento.tipo === 'externo' ? 'bg-blue-600 text-white' : 'bg-white'}`}>EXTERNO</button>
                    <button onClick={() => setTempEvento({...tempEvento, tipo: 'interno'})} className={`flex-1 ${tempEvento.tipo === 'interno' ? 'bg-black text-white' : 'bg-white'}`}>INTERNO</button>
                  </div>
                </div>
                <div className="bg-gray-50 p-8 rounded-[40px] border-2 border-black/5 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase opacity-30 flex items-center gap-1"><CalendarIcon size={12}/> Início</p>
                    <input type="date" value={tempEvento.dataInicio} onChange={e => setTempEvento({...tempEvento, dataInicio: e.target.value})} className="text-xl font-black bg-transparent w-full border-b border-black outline-none" />
                    <input type="time" value={tempEvento.horaInicio} onChange={e => setTempEvento({...tempEvento, horaInicio: e.target.value})} className="text-3xl font-black bg-transparent w-full outline-none" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase opacity-30 flex items-center gap-1"><CalendarIcon size={12}/> Término</p>
                    <input type="date" value={tempEvento.dataTermino} onChange={e => setTempEvento({...tempEvento, dataTermino: e.target.value})} className="text-xl font-black bg-transparent w-full border-b border-black outline-none" />
                    <input type="time" value={tempEvento.horaFim} onChange={e => setTempEvento({...tempEvento, horaFim: e.target.value})} className="text-3xl font-black bg-transparent w-full outline-none" />
                  </div>
                </div>
                <div className="space-y-6">
                    <input value={tempEvento.titulo} onChange={e => setTempEvento({...tempEvento, titulo: e.target.value})} className="w-full text-4xl font-black bg-transparent outline-none uppercase border-b-2 border-black/10 py-2" placeholder="CONTEÚDO PRINCIPAL" />
                    <textarea value={tempEvento.conteudoSecundario} onChange={e => setTempEvento({...tempEvento, conteudoSecundario: e.target.value})} className="w-full text-xl font-bold bg-transparent outline-none h-24 resize-none" placeholder="Conteúdo Alternativo..." />
                </div>
                <div className="flex justify-between items-center pt-8 border-t-2 border-black font-black text-2xl uppercase tracking-tighter">
                  <button onClick={handleSalvar} className="hover:underline decoration-yellow-400 decoration-[12px]">Salvar na Planilha</button>
                  <button onClick={() => setShowEventModal(false)} className="opacity-20 uppercase">Voltar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
