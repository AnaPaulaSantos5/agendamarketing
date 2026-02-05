"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Camera, Plus, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURAÇÕES ---
const PERFIS = [
  { nome: "Confi", chatId: "12036302@g.us" },
  { nome: "Luiza", chatId: "4599992869@u.s" },
  { nome: "Júlio", chatId: "5541998877@c.us" },
  { nome: "Cecília", chatId: "5541887766@u.s" }
];

const CORES_PASTEL = ['#f5886c', '#1260c7', '#ffce0a', '#b8e1dd', '#d1c4e9', '#f8bbd0', '#e1f5fe'];

interface Evento {
  id: string;
  dataKey: string; 
  titulo: string; // Conteúdo Principal
  conteudoSecundario: string;
  linkDrive: string;
  cor: string;
  perfil: string;
  chatId: string;
  tipo: 'interno' | 'externo';
  horaInicio: string;
  horaFim: string;
  dataTermino: string;
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [dataAtiva, setDataAtiva] = useState(new Date(2026, 1, 4)); 
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [capaImage, setCapaImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- ESTADO DO FORMULÁRIO DO MODAL ---
  const [tempEvento, setTempEvento] = useState<Evento>({
    id: '',
    dataKey: '',
    titulo: '',
    conteudoSecundario: '',
    linkDrive: '',
    cor: CORES_PASTEL[0],
    perfil: PERFIS[0].nome,
    chatId: PERFIS[0].chatId,
    tipo: 'externo',
    horaInicio: '08:00',
    horaFim: '09:00',
    dataTermino: '2026-02-04'
  });

  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  const diasNoMes = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 0).getDate(), [dataAtiva]);
  const primeiroDiaSemana = useMemo(() => new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), 1).getDay(), [dataAtiva]);

  const mudarMes = (direcao: number) => setDataAtiva(prev => new Date(prev.getFullYear(), prev.getMonth() + direcao, 1));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCapaImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDiaClick = (dia: number) => {
    const dataKey = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const existente = eventos.find(e => e.dataKey === dataKey);
    const dataString = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), dia));
    
    if (existente) {
      setTempEvento({ ...existente });
    } else {
      setTempEvento({
        id: '',
        dataKey: dataKey,
        titulo: '',
        conteudoSecundario: '',
        linkDrive: '',
        cor: CORES_PASTEL[0],
        perfil: PERFIS[0].nome,
        chatId: PERFIS[0].chatId,
        tipo: 'externo',
        horaInicio: '08:00',
        horaFim: '09:00',
        dataTermino: dataString
      });
    }
    setShowEventModal(true);
  };

  const handleSalvar = () => {
    if (tempEvento.id) {
      setEventos(eventos.map(e => e.id === tempEvento.id ? tempEvento : e));
    } else {
      setEventos([...eventos, { ...tempEvento, id: Date.now().toString() }]);
    }
    setShowEventModal(false);
  };

  const handleExcluir = () => {
    setEventos(eventos.filter(e => e.id !== tempEvento.id));
    setShowEventModal(false);
  };

  const cardStyle: React.CSSProperties = { border: '2px solid black', borderRadius: '30px', padding: '20px', backgroundColor: 'white' };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh' }}>
      
      {/* HEADER / CAPA */}
      <div style={{ ...cardStyle, position: 'relative', marginBottom: '40px', height: '320px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '30px' }}>
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
        <div onClick={() => fileInputRef.current?.click()} style={{ position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 0, backgroundImage: capaImage ? `url(${capaImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!capaImage && <div className="flex flex-col items-center text-gray-300"><Camera size={48} /><span className="font-bold mt-2">Adicionar foto do dispositivo</span></div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1, position: 'relative' }}>
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-black flex items-center justify-center text-4xl font-bold bg-white">A</div>
            <Settings size={26} onClick={(e) => { e.stopPropagation(); setShowPerfilModal(true); }} className="absolute -top-1 -left-1 bg-white border-2 border-black rounded-full p-1.5 cursor-pointer" />
            <ChevronDown size={26} className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white border-2 border-black rounded-full p-0.5" />
          </div>
          <div className="bg-white px-6 py-2 border-2 border-black rounded-2xl shadow-[4px_4px_0px_black]"><h3 className="m-0 text-xl font-bold">Editar Cliente</h3></div>
        </div>
      </div>

      {/* NAVEGAÇÃO MÊS/ANO */}
      <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
        <div className="flex items-center gap-4">
          <ChevronLeft size={45} className="cursor-pointer" onClick={() => mudarMes(-1)} />
          <h1 className="text-7xl font-black italic uppercase tracking-tighter">{meses[dataAtiva.getMonth()]}</h1>
        </div>
        <div className="flex items-center gap-4">
          <h1 className="text-7xl font-light opacity-10 uppercase tracking-tighter">{dataAtiva.getFullYear()}</h1>
          <ChevronRight size={45} className="cursor-pointer" onClick={() => mudarMes(1)} />
        </div>
      </div>

      {/* CALENDÁRIO GRID */}
      <div className="grid grid-cols-7 gap-2 mb-4 text-center opacity-30 font-bold text-sm">
        {diasSemana.map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={i} />)}
        {Array.from({ length: diasNoMes }, (_, i) => {
          const dia = i + 1;
          const key = `${dataAtiva.getFullYear()}-${String(dataAtiva.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          const evento = eventos.find(e => e.dataKey === key);
          const isAtivo = dataAtiva.getDate() === dia;
          return (
            <div key={dia} onClick={() => handleDiaClick(dia)} style={{ ...cardStyle, height: '140px', borderColor: isAtivo ? tempEvento.cor : 'black', backgroundColor: isAtivo ? `${tempEvento.cor}10` : 'white' }} className="cursor-pointer flex flex-col justify-center items-center hover:scale-105 transition-transform">
              <p className="text-xl font-bold">{dia}</p>
              {evento && <div className="w-3 h-3 rounded-full mt-2" style={{ backgroundColor: evento.cor }} />}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showEventModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/10 backdrop-blur-sm p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white border-2 border-black rounded-[50px] p-10 w-full max-w-2xl shadow-[15px_15px_0px_black] max-h-[90vh] overflow-y-auto no-scrollbar">
              
              <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
                <h3 className="text-3xl font-black italic uppercase">{tempEvento.id ? 'Editar Evento' : 'Novo Evento'}</h3>
                <div className="flex gap-2">
                  {CORES_PASTEL.map(c => (
                    <div key={c} onClick={() => setTempEvento({...tempEvento, cor: c})} className={`w-6 h-6 rounded-full border border-black cursor-pointer transition-transform ${tempEvento.cor === c ? 'scale-125' : 'opacity-30'}`} style={{ backgroundColor: c }} />
                  ))}
                  <Plus size={20} className="ml-2 opacity-30 cursor-pointer hover:opacity-100" />
                </div>
              </div>

              <div className="space-y-6">
                {/* PERFIL E TIPO */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold opacity-30 uppercase mb-1">Responsável</p>
                    <select value={tempEvento.perfil} onChange={e => {
                      const p = PERFIS.find(it => it.nome === e.target.value);
                      setTempEvento({...tempEvento, perfil: e.target.value, chatId: p?.chatId || ''});
                    }} className="w-full border-2 border-black rounded-xl p-2 font-bold outline-none">
                      {PERFIS.map(p => <option key={p.nome} value={p.nome}>{p.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-30 uppercase mb-1">Visibilidade</p>
                    <div className="flex border-2 border-black rounded-xl overflow-hidden font-bold text-xs h-11">
                      <button onClick={() => setTempEvento({...tempEvento, tipo: 'externo'})} className={`flex-1 ${tempEvento.tipo === 'externo' ? 'bg-blue-600 text-white' : 'bg-white'}`}>EXTERNO</button>
                      <button onClick={() => setTempEvento({...tempEvento, tipo: 'interno'})} className={`flex-1 ${tempEvento.tipo === 'interno' ? 'bg-black text-white' : 'bg-white'}`}>INTERNO</button>
                    </div>
                  </div>
                </div>

                {/* DATAS E HORÁRIOS */}
                <div className="bg-gray-50 p-6 rounded-[30px] border-2 border-black/5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold opacity-30 uppercase flex items-center gap-1"><CalendarIcon size={10}/> Data Início</p>
                      <input type="date" value={tempEvento.dataKey} disabled className="w-full font-bold opacity-50 outline-none bg-transparent cursor-not-allowed" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold opacity-30 uppercase flex items-center gap-1"><CalendarIcon size={10}/> Data Término</p>
                      <input type="date" value={tempEvento.dataTermino} onChange={e => setTempEvento({...tempEvento, dataTermino: e.target.value})} className="w-full font-bold outline-none bg-transparent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-black/5 pt-4">
                    <div>
                      <p className="text-[10px] font-bold opacity-30 uppercase flex items-center gap-1"><Clock size={10}/> Início</p>
                      <input type="time" value={tempEvento.horaInicio} onChange={e => setTempEvento({...tempEvento, horaInicio: e.target.value})} className="w-full text-xl font-bold bg-transparent outline-none" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold opacity-30 uppercase flex items-center gap-1"><Clock size={10}/> Término</p>
                      <input type="time" value={tempEvento.horaFim} onChange={e => setTempEvento({...tempEvento, horaFim: e.target.value})} className="w-full text-xl font-bold bg-transparent outline-none" />
                    </div>
                  </div>
                </div>

                {/* CONTEÚDOS */}
                <div className="space-y-4">
                  <div className="border-b-2 border-black/10">
                    <p className="text-[10px] font-bold opacity-30 uppercase">Título (Conteúdo Principal)</p>
                    <input value={tempEvento.titulo} onChange={e => setTempEvento({...tempEvento, titulo: e.target.value})} className="w-full text-2xl font-black italic bg-transparent outline-none uppercase" placeholder="DIGITE O CONTEÚDO..." />
                  </div>
                  <div className="border-b-2 border-black/10">
                    <p className="text-[10px] font-bold opacity-30 uppercase">Conteúdo Alternativo (Secundário)</p>
                    <textarea value={tempEvento.conteudoSecundario} onChange={e => setTempEvento({...tempEvento, conteudoSecundario: e.target.value})} className="w-full font-medium bg-transparent outline-none h-16 resize-none" placeholder="Opcional..." />
                  </div>
                </div>

                {/* RODAPÉ DO MODAL */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-[#fff9c4] border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0px_black] overflow-hidden">
                    <p className="text-[9px] font-bold opacity-40 uppercase">WhatsApp ID</p>
                    <p className="font-mono text-xs truncate underline text-blue-800">{tempEvento.chatId}</p>
                  </div>
                  <input placeholder="Link do Drive" value={tempEvento.linkDrive} onChange={e => setTempEvento({...tempEvento, linkDrive: e.target.value})} className="flex-1 border-2 border-black rounded-2xl p-4 font-bold text-xs outline-none h-[68px]" />
                </div>

                <div className="flex justify-between items-center pt-6 font-black italic uppercase tracking-widest">
                  <div className="flex gap-8">
                    <button onClick={handleSalvar} className="hover:underline decoration-yellow-400 decoration-8">SALVAR</button>
                    {tempEvento.id && <button onClick={handleExcluir} className="text-red-500">EXCLUIR</button>}
                  </div>
                  <button onClick={() => setShowEventModal(false)} className="opacity-20">FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
