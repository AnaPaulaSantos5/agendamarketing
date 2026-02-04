"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function AgendaMarketing() {
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);

  // Suas cores principais de marcação
  const cores = {
    laranja: '#f5886c',
    azul: '#1260c7',
    amarelo: '#ffce0a'
  };

  return (
    <div className="min-h-screen bg-[#fdfaf5] p-4 md:p-10 text-black font-sans">
      
      {/* 1. CABEÇALHO: EDITAR CLIENTE */}
      <header className="border-2 border-black rounded-[2.5rem] bg-white p-6 mb-10 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center text-xl font-bold">A</div>
            <Settings className="absolute -top-1 -left-1 w-5 h-5 bg-white border border-black rounded-full p-0.5" />
            <ChevronDown className="absolute -right-1 top-1/2 w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Editar Cliente</h2>
            <div className="text-[12px] leading-tight text-gray-600">
              <p>Nome do Cliente</p>
              <p>WhatsApp ID (ChatId)</p>
              <p>Email do Google</p>
            </div>
          </div>
        </div>
        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl h-20 flex items-center justify-center text-gray-400 text-sm italic">
          Adicionar foto do dispositivo
        </div>
      </header>

      {/* 2. NAVEGAÇÃO DO MÊS */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-10 h-10 cursor-pointer hover:scale-110 transition" />
          <h1 className="text-5xl font-black italic tracking-tighter">MÊS</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-5xl font-light">2026</span>
          <ChevronRight className="w-10 h-10 cursor-pointer hover:scale-110 transition" />
        </div>
      </div>

      {/* 3. GRID DO CALENDÁRIO E PAINÉIS */}
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* CALENDÁRIO HORIZONTAL */}
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x">
            {[...Array(31)].map((_, i) => (
              <div 
                key={i}
                onClick={() => setDiaSelecionado(i + 1)}
                className={`min-w-[130px] h-[130px] border-2 border-black rounded-[1.8rem] p-4 cursor-pointer transition-all snap-start
                  ${diaSelecionado === i + 1 ? 'bg-orange-50 scale-105 border-orange-400' : 'bg-white hover:bg-gray-50'}
                `}
              >
                <p className="font-bold text-sm uppercase">DIA {i + 1}</p>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cores.laranja }}></span>
                  <span className="text-[10px] italic font-medium">evento</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center font-bold text-gray-500 italic tracking-widest">
            {"<--- Clicar e arrastar --->"}
          </p>
        </div>

        {/* 4. PAINÉIS LATERAIS (MODAIS) */}
        <div className="flex flex-col md:flex-row gap-6 shrink-0">
          
          {/* EDITAR EVENTO */}
          <div className="w-full md:w-[280px] border-2 border-black rounded-[2.2rem] p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-5 border-b border-black pb-2">
              <h3 className="font-bold text-xs uppercase tracking-tighter">EDITAR EVENTO</h3>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full cursor-pointer" style={{ backgroundColor: cores.laranja }}></div>
                <div className="w-3 h-3 rounded-full cursor-pointer" style={{ backgroundColor: cores.azul }}></div>
                <div className="w-3 h-3 rounded-full cursor-pointer" style={{ backgroundColor: cores.amarelo }}></div>
                <Plus className="w-3 h-3 cursor-pointer" />
              </div>
            </div>
            
            <div className="space-y-4 text-sm font-medium">
              <p>Início</p>
              <p>Título</p>
              <p className="text-[10px] text-gray-400 italic font-normal">TipoExterno (Notificar) Interno</p>
              <div>
                <p className="text-[11px] text-gray-400">WhatsApp ID</p>
                <p className="font-mono text-[10px] text-blue-600">4599992869@u.s</p>
              </div>
              <p className="text-gray-400 text-xs">Conteúdo Secundário</p>
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 text-[10px] font-bold">
              <button className="hover:text-orange-500 transition">SALVAR</button>
              <button className="hover:text-red-500 transition">EXCLUIR</button>
              <button className="hover:text-gray-400 transition">FECHAR</button>
            </div>
          </div>

          <div className="hidden xl:flex items-center font-black text-gray-300">OU</div>

          {/* NOVO EVENTO (ESTADO DESATIVADO) */}
          <div className="w-full md:w-[280px] border-2 border-black rounded-[2.2rem] p-6 bg-white opacity-40">
            <h3 className="font-bold text-xs uppercase mb-4">NOVO EVENTO</h3>
            <div className="space-y-4 text-sm text-gray-300 italic">
               <p>Início</p>
               <p>Título</p>
               <p>TipoExterno...</p>
               <p>WhatsApp ID</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
