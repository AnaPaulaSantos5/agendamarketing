"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Camera, Clock, Calendar as CalendarIcon, Trash2, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CORES_PASTEL = ['#f5886c', '#1260c7', '#ffce0a', '#b8e1dd', '#d1c4e9', '#f8bbd0', '#e1f5fe', '#c5e1a5', '#ffe082'];

export default function AgendaPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [perfis, setPerfis] = useState<any[]>([]);
  const [perfilAtivo, setPerfilAtivo] = useState<any>(null);
  const [dataAtiva, setDataAtiva] = useState(new Date(2026, 1, 4)); 
  const [showEventModal, setShowEventModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false); // Modal de Edição de Perfil
  const [showPerfilSelector, setShowPerfilSelector] = useState(false);
  const [capaImage, setCapaImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tempEvento, setTempEvento] = useState({
    id: '', dataInicio: '', dataTermino: '', titulo: '', conteudoSecundario: '', 
    linkDrive: '', cor: CORES_PASTEL[0], perfil: '', chatId: '', tipo: 'externo',
    horaInicio: '08:00', horaFim: '09:00'
  });

  // CARREGAR DADOS E CAPA SALVA
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        if (data.events) setEventos(data.events);
        if (data.perfis) {
          setPerfis(data.perfis);
          if (!perfilAtivo) setPerfilAtivo(data.perfis[0]);
        }
      } catch (e) { console.error("Erro ao carregar", e); }
    };

    // Recupera a capa do localStorage
    const savedCapa = localStorage.getItem('agenda_capa_marketing');
    if (savedCapa) setCapaImage(savedCapa);

    carregarDados();
  }, []);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCapaImage(base64String);
        localStorage.setItem('agenda_capa_marketing', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiaClick = (dia: number) => {
    const dataStr = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), dia));
    const existente = eventos.find(e => isDiaNoPeriodo(dataStr, e.dataInicio?.split(' ')[0], e.dataFim?.split(' ')[0]));
    
    if (existente) {
      setTempEvento({
        ...tempEvento,
        id: existente.id,
        titulo: existente.titulo,
        dataInicio: existente.dataInicio?.split(' ')[0],
        dataTermino: existente.dataFim?.split(' ')[0],
        cor: existente.cor,
        tipo: existente.tipo || 'externo'
      });
    } else {
      setTempEvento({
        ...tempEvento, id: '', dataInicio: dataStr, dataTermino: dataStr, titulo: '',
        conteudoSecundario: '', perfil: perfilAtivo?.nome || '', chatId: perfilAtivo?.chatId || ''
      });
    }
    setShowEventModal(true);
  };

  return (
    <div className="p-5 max-w-[1400px] mx-auto bg-white min-h-screen font-sans no-scrollbar">
      
      {/* CAPA SEM SHADOW GROSSO */}
      <div className="relative mb-10 h-80 rounded-[40px] border-2 border-black overflow-hidden flex items-end p-8">
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
        <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 cursor-pointer z-0 bg-gray-50 flex items-center justify-center text-gray-400 font-bold">
          {capaImage ? <img src={capaImage} className="w-full h-full object-cover" /> : "Adicionar Capa do Projeto"}
        </div>
        
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-2 border-black bg-white flex items-center justify-center text-4xl font-black shadow-lg uppercase">
              {perfilAtivo?.nome?.charAt(0) || 'A'}
            </div>
            <button onClick={() => setShowPerfilModal(true)} className="absolute -top-2 -left-2 bg-white border-2 border-black rounded-full p-2 hover:bg-black hover:text-white transition-all">
              <Settings size={20} />
            </button>
          </div>

          <div className="bg-white border-2 border-black px-6 py-2 rounded-2xl flex items-center gap-4 cursor-pointer" onClick={() => setShowPerfilSelector(!showPerfilSelector)}>
            <div>
               <h3 className="text-2xl font-black uppercase leading-none">{perfilAtivo?.nome || "..."}</h3>
               <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{perfilAtivo?.email}</p>
            </div>
            <ChevronDown className="opacity-40" />
            
            <AnimatePresence>
              {showPerfilSelector && (
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="absolute top-20 left-0 bg-white border-2 border-black rounded-2xl p-4 shadow-xl w-48 z-50">
                  {perfis.map(p => (
                    <div key={p.nome} onClick={() => { setPerfilAtivo(p); setShowPerfilSelector(false); }} className="p-2 hover:bg-gray-100 rounded-lg font-bold border-b last:border-0">{p.nome}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO - ANO MAIS NÍTIDO */}
      <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
        <div className="flex items-center gap-4">
          <ChevronLeft size={60} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() - 1, 1))} />
          <h1 className="text-8xl font-black uppercase tracking-tighter leading-none">{meses[dataAtiva.getMonth()]}</h1>
        </div>
        <h1 className="text-8xl font-light opacity-100 text-black uppercase tracking-tighter leading-none">{dataAtiva.getFullYear()}</h1>
        <ChevronRight size={60} className="cursor-pointer hover:scale-110 transition-transform" onClick={() => setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 1))} />
      </div>

      {/* GRID DO CALENDÁRIO */}
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

      {/* MODAL DE EDIÇÃO DO PERFIL (FLUTUA POR CIMA) */}
      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border-2 border-black rounded-[50px] p-12 w-full max-w-xl shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Configurar Perfil</h2>
                <X className="cursor-pointer" onClick={() => setShowPerfilModal(false)} />
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-30 mb-2">Nome do Responsável</p>
                  <input value={perfilAtivo?.nome} className="w-full border-2 border-black rounded-2xl p-4 font-bold outline-none" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-30 mb-2">WhatsApp ChatID</p>
                  <div className="flex items-center gap-3 border-2 border-black rounded-2xl p-4 bg-gray-50">
                    <MessageSquare size={20} className="opacity-30" />
                    <input value={perfilAtivo?.chatId} className="w-full bg-transparent font-mono font-bold outline-none" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-30 mb-2">E-mail do Google</p>
                  <div className="flex items-center gap-3 border-2 border-black rounded-2xl p-4 bg-gray-50">
                    <Mail size={20} className="opacity-30" />
                    <input value={perfilAtivo?.email} className="w-full bg-transparent font-bold outline-none" />
                  </div>
                </div>
                <button onClick={() => setShowPerfilModal(false)} className="w-full bg-black text-white py-5 rounded-[25px] font-black uppercase tracking-widest mt-4">Salvar Alterações</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL DE EVENTO SEM SHADOW GROSSO */}
        {showEventModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-white border-2 border-black rounded-[60px] p-12 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Novo Registro</h2>
                <div className="flex gap-2">
                  {CORES_PASTEL.map(c => (
                    <div key={c} onClick={() => setTempEvento({...tempEvento, cor: c})} className={`w-7 h-7 rounded-full border-2 border-black cursor-pointer transition-transform ${tempEvento.cor === c ? 'scale-125' : 'opacity-30'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
                <X className="cursor-pointer ml-4" onClick={() => setShowEventModal(false)} />
              </div>
              <div className="space-y-8">
                {/* Aqui vai o formulário que já temos... (Resumido para o código caber) */}
                <div className="grid grid-cols-2 gap-6">
                  <select value={tempEvento.perfil} onChange={e => {
                    const p = perfis.find(it => it.nome === e.target.value);
                    setTempEvento({...tempEvento, perfil: e.target.value, chatId: p?.chatId || ''});
                  }} className="border-2 border-black rounded-2xl p-4 font-bold bg-gray-50 outline-none">
                    {perfis.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
                  </select>
                  <div className="flex border-2 border-black rounded-2xl overflow-hidden font-black text-xs h-[60px]">
                    <button onClick={() => setTempEvento({...tempEvento, tipo: 'externo'})} className={`flex-1 ${tempEvento.tipo === 'externo' ? 'bg-blue-600 text-white' : 'bg-white'}`}>EXTERNO</button>
                    <button onClick={() => setTempEvento({...tempEvento, tipo: 'interno'})} className={`flex-1 ${tempEvento.tipo === 'interno' ? 'bg-black text-white' : 'bg-white'}`}>INTERNO</button>
                  </div>
                </div>
                <div className="bg-gray-50 p-8 rounded-[40px] border-2 border-black/5 grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase opacity-30">Período Início</p>
                    <input type="date" value={tempEvento.dataInicio} onChange={e => setTempEvento({...tempEvento, dataInicio: e.target.value})} className="text-xl font-black bg-transparent w-full border-b border-black" />
                    <input type="time" value={tempEvento.horaInicio} onChange={e => setTempEvento({...tempEvento, horaInicio: e.target.value})} className="text-3xl font-black bg-transparent w-full" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase opacity-30">Período Término</p>
                    <input type="date" value={tempEvento.dataTermino} onChange={e => setTempEvento({...tempEvento, dataTermino: e.target.value})} className="text-xl font-black bg-transparent w-full border-b border-black" />
                    <input type="time" value={tempEvento.horaFim} onChange={e => setTempEvento({...tempEvento, horaFim: e.target.value})} className="text-3xl font-black bg-transparent w-full" />
                  </div>
                </div>
                <div className="space-y-6">
                    <input value={tempEvento.titulo} onChange={e => setTempEvento({...tempEvento, titulo: e.target.value})} className="w-full text-4xl font-black bg-transparent outline-none uppercase border-b-2 border-black/10 py-2" placeholder="O QUE VAMOS POSTAR?" />
                    <textarea value={tempEvento.conteudoSecundario} onChange={e => setTempEvento({...tempEvento, conteudoSecundario: e.target.value})} className="w-full text-xl font-bold bg-transparent outline-none h-24 resize-none" placeholder="Caso o principal não seja possível..." />
                </div>
                <div className="flex justify-between items-center pt-8 border-t-2 border-black font-black text-2xl uppercase tracking-tighter">
                  <button onClick={() => { /* Função Salvar */ }} className="hover:underline decoration-yellow-400 decoration-[12px]">Gravar Registro</button>
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
