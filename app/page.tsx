"use client";

import React, { useState } from 'react';
import { Settings, X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simulação de Banco de Dados de Eventos
const eventosIniciais = [
  { id: '1', dia: 1, titulo: 'Reunião Marketing', cor: '#f5886c', whatsapp: '4599992869@u.s' }
];

export default function AgendaFuncional() {
  // --- ESTADOS DE CONTROLE ---
  const [eventos, setEventos] = useState(eventosIniciais);
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  
  // Modais
  const [showConfigModal, setShowConfigModal] = useState(false); // Modal da Engrenagem
  const [showEventModal, setShowEventModal] = useState(false);   // Modal de Eventos (Novo/Editar)
  
  // Dados do Formulário
  const [tempEvento, setTempEvento] = useState({ id: '', titulo: '', whatsapp: '', cor: '#f5886c' });

  // --- AÇÕES ---

  // 1. Ao clicar em um dia do calendário
  const handleDiaClick = (dia: number) => {
    setDiaSelecionado(dia);
    const eventoExistente = eventos.find(e => e.dia === dia);

    if (eventoExistente) {
      // MODO EDIÇÃO: Carrega dados existentes
      setTempEvento(eventoExistente);
    } else {
      // MODO NOVO: Reseta o formulário
      setTempEvento({ id: '', titulo: '', whatsapp: '4599992869@u.s', cor: '#f5886c' });
    }
    setShowEventModal(true);
  };

  // 2. Salvar ou Atualizar
  const handleSalvar = () => {
    if (tempEvento.id) {
      // Atualiza existente
      setEventos(eventos.map(e => e.id === tempEvento.id ? { ...tempEvento } : e));
    } else {
      // Cria novo
      const novo = { ...tempEvento, id: Date.now().toString(), dia: diaSelecionado! };
      setEventos([...eventos, novo]);
    }
    setShowEventModal(false);
  };

  // 3. Excluir Evento
  const handleExcluir = () => {
    setEventos(eventos.filter(e => e.id !== tempEvento.id));
    setShowEventModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f4ece1] p-10 font-sans">
      
      {/* HEADER: Ação na Engrenagem */}
      <div className="flex items-center gap-4 mb-10">
        <div className="relative">
          <button onClick={() => setShowConfigModal(true)} className="p-2 bg-white border border-black rounded-full hover:bg-black hover:text-white transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* GRADE DO CALENDÁRIO (SIMPLIFICADA) */}
      <div className="grid grid-cols-7 gap-4">
        {[...Array(31)].map((_, i) => {
          const dia = i + 1;
          const temEvento = eventos.find(e => e.dia === dia);
          return (
            <div 
              key={dia}
              onClick={() => handleDiaClick(dia)}
              className="h-32 bg-white rounded-[25px] border border-black/5 p-4 cursor-pointer hover:shadow-lg transition-all"
            >
              <span className="font-bold opacity-20">{dia}</span>
              {temEvento && (
                <div style={{ backgroundColor: temEvento.cor }} className="w-3 h-3 rounded-full mt-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* --- CAMADA DE MODAIS (FLUTUANTES) --- */}
      <AnimatePresence>
        
        {/* 1. MODAL DE CONFIGURAÇÃO (ENGRENAGEM) */}
        {showConfigModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-10 rounded-[40px] border-2 border-black w-full max-w-md shadow-2xl">
              <div className="flex justify-between mb-6">
                <h2 className="font-bold text-2xl uppercase italic">Editar Cliente</h2>
                <X onClick={() => setShowConfigModal(false)} className="cursor-pointer" />
              </div>
              {/* Conteúdo do Modal aqui */}
              <button onClick={() => setShowConfigModal(false)} className="w-full bg-black text-white py-3 rounded-full font-bold">SALVAR ALTERAÇÕES</button>
            </motion.div>
          </div>
        )}

        {/* 2. MODAL DE EVENTOS (NOVO OU EDITAR) */}
        {showEventModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white p-10 rounded-[45px] border-2 border-black w-full max-w-lg shadow-2xl relative">
              
              <h2 className="text-4xl font-black italic uppercase mb-8 border-b-2 border-black/10 pb-4">
                {tempEvento.id ? 'Editar Evento' : 'Novo Evento'}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Título do Evento</label>
                  <input 
                    className="w-full text-2xl font-bold italic outline-none bg-transparent"
                    value={tempEvento.titulo}
                    onChange={(e) => setTempEvento({...tempEvento, titulo: e.target.value})}
                    placeholder="DIGITE AQUI..."
                  />
                </div>

                <div className="flex gap-3 mb-6">
                  {['#f5886c', '#1260c7', '#ffce0a'].map(c => (
                    <div 
                      key={c} 
                      onClick={() => setTempEvento({...tempEvento, cor: c})}
                      style={{ backgroundColor: c }} 
                      className={`w-8 h-8 rounded-full border border-black cursor-pointer ${tempEvento.cor === c ? 'scale-125' : 'opacity-40'}`}
                    />
                  ))}
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="flex gap-8 pt-6 font-bold uppercase italic text-sm tracking-widest">
                  <button onClick={handleSalvar} className="hover:text-blue-600 transition-colors">SALVAR</button>
                  {tempEvento.id && (
                    <button onClick={handleExcluir} className="text-red-500 hover:underline">EXCLUIR</button>
                  )}
                  <button onClick={() => setShowEventModal(false)} className="opacity-20 hover:opacity-100">FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
