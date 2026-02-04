"use client";
import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function AgendaReferencia() {
  const calendarRef = useRef<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Funções de Navegação
  const nextMonth = () => {
    calendarRef.current.getApi().next();
    setCurrentDate(calendarRef.current.getApi().getDate());
  };
  const prevMonth = () => {
    calendarRef.current.getApi().prev();
    setCurrentDate(calendarRef.current.getApi().getDate());
  };

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER SUPERIOR */}
      <header className="bubble-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img src="/perfil-google.png" className="w-16 h-16 rounded-full border-2 border-white shadow-md" alt="User" />
            <button className="absolute -top-1 -left-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
              <Settings size={18} />
            </button>
          </div>
          <div className="bubble-card px-6 py-3 border-2 border-gray-800">
            <span className="font-bold text-lg uppercase tracking-wide">Editar Cliente</span>
          </div>
        </div>
        <div className="text-gray-400 font-medium italic cursor-pointer hover:text-black">
          Adicionar foto do dispositivo
        </div>
      </header>

      {/* SELETOR DE MÊS / ANO */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-8">
           <button onClick={prevMonth} className="hover:scale-110 transition-transform"><ChevronLeft size={48} /></button>
           <h2 className="text-8xl font-black italic uppercase tracking-tighter">Mês</h2>
           <button onClick={nextMonth} className="hover:scale-110 transition-transform"><ChevronRight size={48} /></button>
        </div>
        <div className="flex items-center gap-6 flex-1 justify-center">
           <div className="h-[2px] bg-black/10 flex-1 mx-10"></div>
           <h2 className="text-8xl font-black italic opacity-10 uppercase tracking-tighter">
             {currentDate.getFullYear()}
           </h2>
        </div>
      </div>

      {/* CALENDÁRIO COM CLIQUE E ARRASTE */}
      <main className="bubble-card p-8">
        <FullCalendar
          ref={calendarRef}
          plugins={[daygridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          select={(info) => setModalOpen(true)} // Abre modal ao clicar e arrastar
          dateClick={() => setModalOpen(true)} // Abre modal ao clicar
          locale="pt-br"
          headerToolbar={false}
          dayMaxEvents={true}
        />
      </main>

      {/* MODAL FLUTUANTE (SOBREPOSIÇÃO) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bubble-card p-10 max-w-2xl w-full relative border-2 border-gray-900 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-4xl font-black italic uppercase">Novo Evento</h3>
                <div className="flex gap-2">
                   {['#f5886c', '#1260c7', '#ffce0a'].map(color => (
                     <div key={color} style={{backgroundColor: color}} className="w-8 h-8 rounded-full border border-black/10 cursor-pointer hover:scale-110 transition-transform" />
                   ))}
                   <Plus className="ml-2 text-gray-400 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-b-2 border-black/10 pb-2">
                  <p className="text-xs font-bold text-gray-400 uppercase italic">Título</p>
                  <input className="w-full bg-transparent text-2xl font-bold outline-none italic" placeholder="DIGITE O TÍTULO..." />
                </div>
                
                <div className="bg-gray-50 rounded-[25px] p-6 border border-gray-100">
                  <p className="text-blue-600 font-mono text-xl underline">WhatsApp ID: 4599992869@u.s</p>
                </div>

                <div className="flex gap-6 pt-6 text-xl font-black italic uppercase">
                  <button className="hover:text-green-600 transition-colors">Salvar</button>
                  <button className="hover:text-red-600 transition-colors">Excluir</button>
                  <button onClick={() => setModalOpen(false)} className="text-gray-300">Fechar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
