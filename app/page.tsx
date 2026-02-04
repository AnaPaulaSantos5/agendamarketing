"use client";

import React, { useState } from 'react';
import { Settings, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Definindo a estrutura exata do Evento para o TypeScript
interface Evento {
  id: string;
  dia: number;
  titulo: string;
  cor: string;
  whatsapp: string;
}

export default function AgendaPage() {
  // --- ESTADOS ---
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Estado do formulário
  const [tempEvento, setTempEvento] = useState({ 
    id: '', 
    titulo: '', 
    whatsapp: '4599992869@u.s', 
    cor: '#f5886c' 
  });

  const cores = { orange: '#f5886c', blue: '#1260c7', yellow: '#ffce0a' };

  // --- FUNÇÕES ---

  const handleDiaClick = (dia: number) => {
    setDiaSelecionado(dia);
    const existente = eventos.find(e => e.dia === dia);
    
    if (existente) {
      setTempEvento({ ...existente });
    } else {
      setTempEvento({ id: '', titulo: '', whatsapp: '4599992869@u.s', cor: '#f5886c' });
    }
    setShowEventModal(true);
  };

  const handleSalvar = () => {
    if (diaSelecionado === null) return;

    if (tempEvento.id) {
      // Editar
      setEventos(eventos.map(e => e.id === tempEvento.id ? { ...tempEvento, dia: diaSelecionado } : e));
    } else {
      // Novo
      const novoEvento: Evento = {
        ...tempEvento,
        id: Date.now().toString(),
        dia: diaSelecionado
      };
      setEventos([...eventos, novoEvento]);
    }
    setShowEventModal(false);
  };

  const handleExcluir = () => {
    setEventos(eventos.filter(e => e.id !== tempEvento.id));
    setShowEventModal(false);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-white font-sans antialiased">
      
      {/* HEADER CLEAN */}
      <div className="flex items-center justify-between mb-12 border-2 border-black rounded-[40px] p-8 h-44">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center text-3xl font-bold bg-gray-50">A</div>
            <button onClick={() => setShowPerfilModal(true)} className="absolute -top-2 -left-2 bg-white border border-black rounded-full p-2 hover:bg-black hover:text-white transition-all">
              <Settings size={18} />
            </button>
            <ChevronDown size={22} className="absolute -right-6 top-1/2 -translate-y-1/2 text-black/20" />
          </div>
          <div>
            <h3 className="text-2xl font-bold uppercase italic">Editar Cliente</h3>
            <p className="text-sm opacity-40 uppercase font-medium">Nome do Cliente</p>
          </div>
        </div>
        <div className="flex-1 border-2 border-dashed border-gray-100 h-full mx-10 rounded-[30px] flex items-center justify-center text-gray-300 italic font-medium">
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS --- ANO */}
      <div className="flex justify-between items-center mb-10 border-b-2 border-black pb-4">
        <div className="flex items-center gap-4">
          <ChevronLeft size={45} className="cursor-pointer" />
          <h1 className="text-8xl font-black italic uppercase tracking-tighter">Fevereiro</h1>
        </div>
        <div className="flex items-center gap-4">
          <h1 className="text-8xl font-light opacity-10">2026</h1>
          <ChevronRight size={45} className="cursor-pointer" />
        </div>
      </div>

      {/* CALENDÁRIO HORIZONTAL */}
      <div className="flex gap-4 overflow-x-auto pb-10 no-scrollbar">
        {[...Array(20)].map((_, i) => {
          const dia = i + 1;
          const evento = eventos.find(e => e.dia === dia);
          return (
            <div 
              key={dia} 
              onClick={() => handleDiaClick(dia)}
              className={`min-w-[160px] h-[160px] rounded-[35px] border-2 p-6 cursor-pointer transition-all flex flex-col justify-between
                ${diaSelecionado === dia ? 'border-[#f5886c] bg-[#fef3f0]' : 'border-black'}`}
            >
              <span className="font-bold text-xl uppercase italic">Dia {dia}</span>
              {evento && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: evento.cor }} />}
            </div>
          );
        })}
      </div>

      {/* --- MODAIS FLUTUANTES (OVERLAYS) --- */}
      <AnimatePresence>
        
        {/* MODAL EDITAR CLIENTE */}
        {showPerfilModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/5 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white border-2 border-black rounded-[50px] p-12 w-full max-w-lg shadow-[20px_20px_0px_0px_black]">
              <div className="flex justify-between mb-8">
                <h2 className="text-4xl font-bold italic uppercase">Editar Cliente</h2>
                <X className="cursor-pointer" onClick={() => setShowPerfilModal(false)} />
              </div>
              <div className="space-y-6">
                <input className="w-full border-b-2 border-black py-2 outline-none text-xl" placeholder="Nome do Cliente" />
                <button className="font-bold text-lg mt-6" onClick={() => setShowPerfilModal(false)}>SALVAR</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL EVENTO (NOVO/EDITAR) */}
        {showEventModal && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/5 backdrop-blur-sm">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              className="bg-white border-2 border-black rounded-[50px] p-12 w-full max-w-xl shadow-[20px_20px_0px_0px_black]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-4xl font-bold italic uppercase">{tempEvento.id ? 'Editar Evento' : 'Novo Evento'}</h3>
                <div className="flex gap-2">
                  {Object.values(cores).map(c => (
                    <div key={c} onClick={() => setTempEvento({...tempEvento, cor: c})}
                      className={`w-6 h-6 rounded-full border border-black cursor-pointer ${tempEvento.cor === c ? 'scale-125' : 'opacity-20'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <input 
                  className="w-full text-5xl font-bold italic border-b-2 border-black/10 outline-none uppercase bg-transparent"
                  placeholder="TÍTULO..."
                  value={tempEvento.titulo}
                  onChange={(e) => setTempEvento({...tempEvento, titulo: e.target.value})}
                />
                <div className="bg-blue-600 p-6 rounded-[25px] text-white font-mono text-xl underline">
                  {tempEvento.whatsapp}
                </div>
                <div className="flex justify-between pt-6 font-bold tracking-widest uppercase">
                  <button onClick={handleSalvar}>SALVAR</button>
                  {tempEvento.id && <button onClick={handleExcluir} className="text-red-500">EXCLUIR</button>}
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
