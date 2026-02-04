"use client";

import React from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function AgendaPage() {
  // Suas cores de marcação
  const brandColors = {
    orange: '#f5886c',
    blue: '#1260c7',
    yellow: '#ffce0a'
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 md:p-8 bg-[#fdfaf5] min-h-screen text-black">
      
      {/* SEÇÃO SUPERIOR - EDITAR CLIENTE */}
      <div className="border-2 border-black rounded-3xl p-6 mb-10 flex flex-col md:flex-row items-center gap-6 bg-white shadow-sm">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center text-2xl font-bold relative">
            A
            <Settings className="absolute -top-1 -left-1 w-5 h-5 bg-white rounded-full p-0.5" />
            <ChevronDown className="absolute -right-1 top-1/2 w-5 h-5" />
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left leading-relaxed">
          <h2 className="font-bold text-lg">Editar Cliente</h2>
          <p className="text-sm">Nome do Cliente</p>
          <p className="text-sm font-mono text-gray-500">WhatsApp ID (ChatId)</p>
          <p className="text-sm">Email do Google</p>
        </div>

        <div className="flex-1 border-2 border-dashed border-gray-400 rounded-2xl h-24 flex items-center justify-center text-gray-400 text-sm italic p-4 text-center">
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO E NAVEGAÇÃO */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-10 h-10 cursor-pointer" />
          <h1 className="text-5xl font-black italic tracking-tighter">MÊS</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-5xl font-light">2026</span>
          <ChevronRight className="w-10 h-10 cursor-pointer" />
        </div>
      </div>

      {/* CORPO DO CALENDÁRIO E PAINÉIS */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* GRID DE DIAS (CALENDÁRIO) */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-4">
            {[1, 2, 3, 4, 5].map((dia) => (
              <div key={dia} className="w-32 h-32 border-2 border-black rounded-[2rem] p-4 bg-white hover:bg-orange-50 cursor-pointer transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-bold text-sm uppercase">DIA {dia}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColors.orange }}></span>
                  <span className="text-[10px] italic">evento</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 font-medium italic text-gray-600">--- Clicar e arrastar ---</p>
        </div>

        {/* PAINÉIS LATERAIS */}
        <div className="flex flex-col md:flex-row gap-6 w-full xl:w-auto">
          
          {/* PAINEL EDITAR */}
          <div className="w-full md:w-64 border-2 border-black rounded-[2.5rem] p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-4 border-b pb-2 border-black">
              <h3 className="font-bold text-xs uppercase">Editar Evento</h3>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColors.orange }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColors.blue }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandColors.yellow }}></div>
                <Plus className="w-3 h-3" />
              </div>
            </div>
            <div className="space-y-3 text-sm font-medium">
              <p>Início</p>
              <p>Título</p>
              <p className="text-[10px] text-gray-500 italic font-normal">TipoExterno (Notificar) Interno</p>
              <p className="text-xs font-mono text-blue-600 break-all">4599992869@u.s</p>
              <p className="text-gray-400 text-xs">Conteúdo Secundário</p>
            </div>
          </div>

          <div className="hidden xl:flex items-center font-bold text-gray-300">OU</div>

          {/* PAINEL NOVO */}
          <div className="w-full md:w-64 border-2 border-black rounded-[2.5rem] p-6 bg-white opacity-60">
             <h3 className="font-bold text-xs uppercase mb-4">Novo Evento</h3>
             <div className="space-y-4 text-sm text-gray-400 italic">
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
