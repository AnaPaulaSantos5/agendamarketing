"use client";
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaMarketing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-12">
      
      {/* HEADER: EDITAR CLIENTE */}
      <header className="neo-card rounded-[60px] p-8 flex items-center justify-between h-40">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-4xl font-black">A</div>
          <div className="border-4 border-black rounded-[25px] p-4 bg-white shadow-[4px_4px_0px_0px_black]">
            <h1 className="font-black text-2xl uppercase italic">Editar Cliente</h1>
          </div>
        </div>
        <span className="font-bold underline italic cursor-pointer">Adicionar foto do dispositivo</span>
      </header>

      {/* TIMELINE: MÊS 2026 */}
      <div className="flex items-center gap-6">
        <h2 className="text-9xl font-black italic uppercase tracking-tighter">Mês</h2>
        <div className="flex-1 h-4 bg-black rounded-full"></div>
        <h2 className="text-9xl font-black italic opacity-10 tracking-tighter">2026</h2>
      </div>

      {/* CALENDÁRIO */}
      <main className="bg-white rounded-[50px] p-6 neo-card">
        <FullCalendar 
          plugins={[daygridPlugin, interactionPlugin]} 
          initialView="dayGridMonth"
          headerToolbar={false}
          dateClick={(arg: any) => { setSelectedDate(arg.dateStr); setModalOpen(true); }}
        />
      </main>

      {/* MODAL DE EVENTO (FOTO 3) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }}
              className="neo-card rounded-[70px] p-12 max-w-lg w-full relative"
            >
              <h3 className="text-5xl font-black italic uppercase mb-8 border-b-4 border-black pb-4">Novo Evento</h3>
              <div className="space-y-6 font-bold italic">
                <input placeholder="TÍTULO" className="w-full text-4xl bg-transparent border-b-4 border-black outline-none" />
                <div className="bg-[#fff9c4] border-4 border-black p-6 rounded-[30px] shadow-[8px_8px_0px_0px_black] -rotate-1">
                  <p className="text-blue-600 underline text-xl font-mono">WhatsApp ID: 4599992869@u.s</p>
                </div>
                <div className="flex gap-8 pt-6">
                  <button className="text-3xl font-black hover:underline decoration-yellow-400">SALVAR</button>
                  <button onClick={() => setModalOpen(false)} className="text-3xl font-black opacity-30">FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
