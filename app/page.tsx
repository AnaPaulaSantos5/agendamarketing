"use client";

import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Settings, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaCausten() {
  const calendarRef = useRef<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState<any>(null);

  // Cores do Template
  const colors = { orange: '#f5886c', blue: '#1260c7', yellow: '#ffce0a' };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen relative">
      
      {/* HEADER CLEAN */}
      <header className="flex justify-between items-start mb-16">
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer" onClick={() => setShowUserModal(true)}>
            <div className="w-20 h-20 rounded-full border-2 border-black flex items-center justify-center text-3xl font-bold bg-gray-50">
              A
            </div>
            <div className="absolute -top-2 -left-2 bg-white border border-black rounded-full p-1.5 hover:rotate-90 transition-transform">
              <Settings size={18} />
            </div>
          </div>
          <div className="space-y-1">
             <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm">
                <span className="text-sm font-bold uppercase tracking-wider">Perfil Ativo</span>
                <ChevronLeft size={14} />
                <ChevronRight size={14} />
             </div>
          </div>
        </div>
        <button className="text-gray-400 text-sm font-medium hover:text-black transition-colors underline underline-offset-4">
          Adicionar foto do dispositivo
        </button>
      </header>

      {/* NAVEGAÇÃO TEMPO (MÊS --- ANO) */}
      <div className="flex items-center justify-between mb-10 border-b-2 border-black pb-6">
        <div className="flex items-center gap-6">
          <ChevronLeft className="cursor-pointer" size={40} onClick={() => calendarRef.current.getApi().prev()} />
          <h1 className="text-8xl font-black italic tracking-tighter uppercase">Mês</h1>
        </div>
        <div className="flex-1 mx-12 h-[2px] bg-gray-200" />
        <div className="flex items-center gap-6">
          <h1 className="text-8xl font-light tracking-tighter uppercase opacity-20">2026</h1>
          <ChevronRight className="cursor-pointer" size={40} onClick={() => calendarRef.current.getApi().next()} />
        </div>
      </div>

      {/* CALENDÁRIO FULL-GRID */}
      <main className="z-10 relative">
        <FullCalendar
          ref={calendarRef}
          plugins={[daygridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          headerToolbar={false}
          locale="pt-br"
          select={(info) => {
            setSelectedRange(info);
            setShowEventModal(true);
          }}
          dateClick={() => setShowEventModal(true)}
        />
      </main>

      {/* OVERLAY MODALS (ANIMAÇÕES) */}
      <AnimatePresence>
        {/* MODAL EDITAR CLIENTE (ENGRENAGEM) */}
        {showUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-glass p-12 w-full max-w-xl">
              <h2 className="text-4xl font-bold mb-8 italic uppercase">Editar Cliente</h2>
              <div className="space-y-6 text-lg">
                <input className="w-full border-b-2 border-black py-2 outline-none" placeholder="Nome do Cliente" />
                <input className="w-full border-b-2 border-black py-2 outline-none" placeholder="WhatsApp ID" />
                <div className="flex justify-between pt-10 font-bold">
                  <button onClick={() => setShowUserModal(false)}>SALVAR</button>
                  <button onClick={() => setShowUserModal(false)} className="opacity-30">FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL NOVO EVENTO (CALENDÁRIO) */}
        {showEventModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-sm">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="modal-glass p-10 w-full max-w-lg relative border-2 border-black">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold italic uppercase">Novo Evento</h3>
                <div className="flex gap-3">
                  {Object.values(colors).map(c => <div key={c} className="w-6 h-6 rounded-full border border-black" style={{ backgroundColor: c }} />)}
                </div>
              </div>
              <div className="space-y-8 font-medium">
                <div className="border-b-2 border-black/10 pb-2">
                  <p className="text-[10px] uppercase font-bold opacity-30">Título</p>
                  <input className="w-full text-2xl font-bold outline-none bg-transparent" placeholder="DIGITE O TÍTULO..." />
                </div>
                <div className="bg-blue-600 text-white p-5 rounded-[25px] flex justify-between items-center">
                  <span className="font-mono">4599992869@u.s</span>
                </div>
                <div className="flex justify-between pt-6 font-bold text-sm tracking-widest">
                  <button className="hover:underline">SALVAR</button>
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
