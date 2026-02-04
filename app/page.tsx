"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaPage() {
  const [diaAtivo, setDiaAtivo] = useState<number | null>(1);
  const [showConfig, setShowConfig] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(true);

  const colors = { orange: '#f5886c', blue: '#1260c7', yellow: '#ffce0a' };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-white font-causten-normal">
      
      {/* CABEÇALHO - LOGIN GOOGLE + ACESSO CONFIG */}
      <div className="flex items-center justify-between mb-12 gap-10 h-44 border-2 border-black rounded-[40px] p-8 bg-white relative">
        <div className="flex items-center gap-6 min-w-[350px]">
          <div className="relative group">
            {/* Foto do Google / Letra */}
            <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center text-4xl font-causten-bold bg-gray-50 overflow-hidden">
               <img src="/api/placeholder/100/100" alt="Google User" className="w-full h-full object-cover" />
            </div>
            {/* Gatilho da Engrenagem para Editar Cliente */}
            <button 
              onClick={() => setShowConfig(true)}
              className="absolute -top-2 -left-2 bg-white border border-black rounded-full p-2 hover:bg-black hover:text-white transition-all shadow-sm"
            >
              <Settings size={20} />
            </button>
            <ChevronDown size={24} className="absolute -right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-causten-bold uppercase tracking-tight">Nome de Usuário</h3>
            <p className="text-sm opacity-50 uppercase tracking-widest font-causten-normal">Perfil Selecionado</p>
          </div>
        </div>

        {/* ÁREA DE FOTO DISPOSITIVO */}
        <div className="flex-1 border-2 border-dashed border-gray-200 h-full rounded-[30px] flex items-center justify-center text-gray-400 font-causten-normal hover:border-black hover:text-black transition-all cursor-pointer italic">
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS --- ANO (LINHA CLEAN) */}
      <div className="flex justify-between items-center mb-10 pb-6">
        <div className="flex items-center gap-6">
          <ChevronLeft size={60} strokeWidth={2.5} className="cursor-pointer" />
          <h1 className="text-[120px] font-causten-bold leading-none tracking-tighter uppercase italic">Mês</h1>
        </div>
        <div className="flex-1 mx-16 h-[2px] bg-black"></div>
        <div className="flex items-center gap-6">
          <h1 className="text-[120px] font-causten-normal leading-none tracking-tighter uppercase opacity-20">2026</h1>
          <ChevronRight size={60} strokeWidth={2.5} className="cursor-pointer" />
        </div>
      </div>

      {/* CALENDÁRIO HORIZONTAL (SISTEMA DE BOLHAS) */}
      <div className="mb-12">
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(dia => (
            <div 
              key={dia} 
              onClick={() => { setDiaAtivo(dia); setModoEdicao(true); }}
              className={`min-w-[160px] h-[160px] rounded-[35px] border-2 p-6 transition-all cursor-pointer flex flex-col justify-between
                ${diaAtivo === dia ? 'border-[#f5886c] bg-[#fef3f0] scale-105' : 'border-black bg-white'}`}
            >
              <p className="font-causten-bold text-xl uppercase tracking-widest">Dia {dia}</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors.orange }} />
                <span className="text-xs font-causten-normal italic opacity-60">Evento Ativo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL EDITAR CLIENTE (SOBREPOSIÇÃO) */}
      <AnimatePresence>
        {showConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} 
              className="bg-white border-2 border-black rounded-[50px] p-12 w-full max-w-xl shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between items-start mb-10">
                <h2 className="text-5xl font-causten-bold italic uppercase tracking-tighter">Editar Cliente</h2>
                <X className="cursor-pointer" onClick={() => setShowConfig(false)} />
              </div>
              <div className="space-y-8">
                <div className="border-b-2 border-black/10 pb-2">
                  <p className="text-[10px] font-causten-bold opacity-30 uppercase tracking-widest">Nome do Cliente</p>
                  <input className="w-full text-2xl font-causten-normal bg-transparent outline-none" placeholder="Digite o nome..." />
                </div>
                <div className="border-b-2 border-black/10 pb-2">
                  <p className="text-[10px] font-causten-bold opacity-30 uppercase tracking-widest">WhatsApp ID (ChatId)</p>
                  <input className="w-full text-2xl font-causten-normal bg-transparent outline-none" placeholder="ID do Chat" />
                </div>
                <div className="flex gap-8 pt-8 font-causten-bold text-lg italic">
                  <button className="hover:underline decoration-4">SALVAR</button>
                  <button onClick={() => setShowConfig(false)} className="opacity-20 hover:opacity-100">FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERFACE DE EVENTO (LADO A LADO) */}
      <div className="flex items-start gap-12 mt-10">
          {/* PAINEL DINÂMICO DE EVENTO */}
          <div className="border-2 border-black rounded-[45px] p-10 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
            <div className="flex justify-between items-center mb-10">
              <span className="font-causten-bold text-xl uppercase tracking-tighter italic">Editar Evento</span>
              <div className="flex gap-3">
                {Object.values(colors).map(c => (
                  <div key={c} style={{ backgroundColor: c }} className="w-6 h-6 rounded-full border border-black cursor-pointer hover:scale-110" />
                ))}
              </div>
            </div>
            
            <div className="space-y-6 font-causten-normal">
              <p className="text-4xl font-causten-bold italic border-b-2 border-black/10 pb-4 uppercase">Título Exemplo</p>
              <div className="bg-[#fff9c4] border-2 border-black p-6 rounded-[30px] shadow-[6px_6px_0px_0px_black] rotate-1">
                <p className="text-xl font-causten-bold text-blue-700 underline">4599992869@u.s</p>
              </div>
            </div>

            <div className="mt-12 flex justify-between font-causten-bold text-sm tracking-widest italic">
              <button>SALVAR</button>
              <button className="opacity-20">EXCLUIR</button>
              <button className="opacity-20">FECHAR</button>
            </div>
          </div>
      </div>
    </div>
  );
}
