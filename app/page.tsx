"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';

export default function AgendaPage() {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(true);

  // Cores principais definidas no seu projeto
  const colors = {
    orange: '#f5886c',
    blue: '#1260c7',
    yellow: '#ffce0a'
  };

  return (
    <div className="min-h-screen bg-white p-8 text-black font-sans">
      
      {/* 1. CABEÇALHO: EDITAR CLIENTE */}
      <header className="border-2 border-black rounded-[2rem] p-6 mb-12 flex items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center text-2xl font-bold">
              A
            </div>
            <Settings className="absolute -top-2 -left-2 w-5 h-5 cursor-pointer" />
            <ChevronDown className="absolute -right-2 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer" />
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Editar Cliente</h2>
          <div className="text-sm space-y-1 text-gray-600">
            <p>Nome do Cliente</p>
            <p>WhatsApp ID (ChatId)</p>
            <p>Email do Google</p>
          </div>
        </div>

        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl h-24 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition">
          Adicionar foto do dispositivo
        </div>
      </header>

      {/* 2. NAVEGAÇÃO DO MÊS */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-4">
          <ChevronLeft className="w-8 h-8 cursor-pointer" />
          <h1 className="text-5xl font-black tracking-tighter">MÊS</h1>
        </div>
        <div className="flex items-center gap-4 text-5xl font-light">
          <span>2026</span>
          <ChevronRight className="w-8 h-8 cursor-pointer" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* 3. CALENDÁRIO (DIA A DIA) */}
        <div className="flex-1">
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {[1, 2, 3, 4, 5].map((dia) => (
              <div 
                key={dia}
                onClick={() => setSelectedDays([dia])}
                className={`min-w-[120px] h-[120px] border-2 border-black rounded-[1.5rem] p-4 cursor-pointer transition-all ${selectedDays.includes(dia) ? 'bg-gray-100 scale-105' : 'bg-white'}`}
              >
                <span className="font-bold text-lg uppercase block">DIA {dia}</span>
                <div className="flex items-center gap-1 mt-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.orange }}></span>
                  <span className="text-xs text-gray-500 italic">evento</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center font-medium italic">Clicar e arrastar</p>
        </div>

        {/* 4. PAINÉIS LATERAIS (EDITAR / NOVO) */}
        <div className="flex flex-col sm:flex-row gap-6">
          
          {/* PAINEL EDITAR EVENTO */}
          <div className="w-full sm:w-72 border-2 border-black rounded-[2rem] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold uppercase text-sm">Editar Evento</h3>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-full cursor-pointer" style={{ backgroundColor: colors.orange }}></div>
                <div className="w-3 h-3 rounded-full cursor-pointer" style={{ backgroundColor: colors.blue }}></div>
                <div className="w-3 h-3 rounded-full cursor-pointer" style={{ backgroundColor: colors.yellow }}></div>
                <PlusCircle className="w-3 h-3 cursor-pointer" />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div><label className="block text-gray-400">Início</label> <p className="font-medium">Título</p></div>
              <div><label className="block text-gray-400 italic font-light">TipoExterno (Notificar)Interno</label></div>
              <div>
                <label className="block text-gray-400">WhatsApp ID</label>
                <p className="font-mono text-xs text-blue-600">4599992869@u.s</p>
              </div>
              <div><label className="block text-gray-400">Conteúdo Secundário</label></div>
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 text-[10px] font-bold">
              <button className="hover:text-red-500">SALVAR</button>
              <button className="hover:text-red-500">EXCLUIR</button>
              <button className="hover:text-gray-500">FECHAR</button>
            </div>
          </div>

          <span className="flex items-center justify-center font-bold text-gray-400">OU</span>

          {/* PAINEL NOVO EVENTO */}
          <div className="w-full sm:w-72 border-2 border-black rounded-[2rem] p-6">
            <h3 className="font-bold uppercase text-sm mb-4">Novo Evento</h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-400">Início</p>
              <p className="text-gray-400">Título</p>
              <p className="text-gray-400 italic font-light">TipoExterno (Notificar)Interno</p>
              <p className="text-gray-400 italic">WhatsApp ID</p>
              <p className="font-mono text-xs text-gray-300">4599992869@u.s</p>
              <p className="text-gray-400">Conteúdo Secundário</p>
            </div>

            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 text-[10px] font-bold text-gray-400">
              <button>SALVAR</button>
              <button>EXCLUIR</button>
              <button>FECHAR</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
