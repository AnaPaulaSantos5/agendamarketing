"use client";
import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-react';

export default function AgendaAlinhada() {
  const calendarRef = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleNext = () => { calendarRef.current.getApi().next(); setCurrentDate(calendarRef.current.getApi().getDate()); };
  const handlePrev = () => { calendarRef.current.getApi().prev(); setCurrentDate(calendarRef.current.getApi().getDate()); };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10">
      
      {/* HEADER: PERFIL E CONFIGURAÇÃO */}
      <header className="bubble-card flex items-center justify-between h-40">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-black bg-gray-200 overflow-hidden">
              <img src="/foto-perfil.png" alt="Google Profile" className="w-full h-full object-cover" />
            </div>
            <button className="absolute -top-2 -left-2 bg-white border-2 border-black rounded-full p-1 shadow-sm">
              <Settings size={20} />
            </button>
            <button className="absolute -bottom-1 -right-1 bg-black text-white rounded-full p-1">
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="bubble-card px-8 py-3 h-auto">
            <h1 className="font-black text-2xl uppercase italic">Editar Cliente</h1>
          </div>
        </div>
        <button className="font-bold underline italic text-gray-500 hover:text-black">Adicionar foto do dispositivo</button>
      </header>

      {/* NAVEGAÇÃO: MÊS E ANO COM SETAS */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <button onClick={handlePrev} className="p-4 hover:bg-black/5 rounded-full transition-all"><ChevronLeft size={60} strokeWidth={3} /></button>
          <h2 className="text-[12rem] font-black italic uppercase leading-none tracking-tighter">Mês</h2>
          <button onClick={handleNext} className="p-4 hover:bg-black/5 rounded-full transition-all"><ChevronRight size={60} strokeWidth={3} /></button>
        </div>
        <div className="flex items-center gap-10 flex-1 justify-end">
          <div className="h-2 bg-black flex-1 max-w-[400px] rounded-full"></div>
          <h2 className="text-[12rem] font-black italic opacity-5 leading-none tracking-tighter">2026</h2>
        </div>
      </div>

      {/* CALENDÁRIO: QUADRADOS ARREDONDADOS */}
      <main className="p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[daygridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          select={() => setModalOpen(true)} // Abre ao arrastar
          dateClick={() => setModalOpen(true)} // Abre ao clicar
          headerToolbar={false}
          locale="pt-br"
          dayMaxEvents={true}
        />
      </main>

      {/* MODAL: SOBREPOSIÇÃO (NÃO EMPILHADO) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bubble-card max-w-2xl w-full relative"
            >
              <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
                <h3 className="text-5xl font-black italic uppercase">Novo Evento</h3>
                <div className="flex gap-3">
                  {['#f5886c', '#1260c7', '#ffce0a'].map(c => (
                    <div key={c} style={{backgroundColor: c}} className="w-10 h-10 rounded-full border-4 border-black cursor-pointer shadow-sm hover:scale-110 transition-transform" />
                  ))}
                  <Plus className="ml-2 cursor-pointer text-gray-400" />
                </div>
              </div>

              <div className="space-y-8 font-black italic uppercase">
                <div className="border-b-4 border-black pb-2">
                   <p className="text-xs opacity-30">Título</p>
                   <input placeholder="DIGITE O TÍTULO..." className="w-full text-4xl bg-transparent outline-none" />
                </div>
                <div className="bg-[#fff9c4] border-4 border-black p-8 rounded-[40px] shadow-[6px_6px_0px_0px_black] rotate-[-1deg]">
                  <p className="text-2xl text-blue-700 underline font-mono">WhatsApp ID: 4599992869@u.s</p>
                </div>
                <div className="flex gap-10 text-4xl pt-8">
                  <button className="hover:underline decoration-[8px] decoration-yellow-400">Salvar</button>
                  <button onClick={() => setModalOpen(false)} className="opacity-20">Fechar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
