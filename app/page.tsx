"use client";
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';

export default function TemplateFinal() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen p-12 space-y-16 max-w-[1400px] mx-auto">
      
      {/* HEADER SUPERIOR (BORDAS ARREDONDADAS) */}
      <header className="bg-white neo-border rounded-[70px] neo-shadow p-10 flex items-center justify-between h-44">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 rounded-full border-6 border-black flex items-center justify-center text-5xl font-black">A</div>
          <div className="neo-border rounded-[30px] p-4 px-10 neo-shadow-sm">
            <h1 className="font-black text-3xl uppercase italic leading-none">Editar Cliente</h1>
          </div>
        </div>
        <button className="font-black italic underline text-xl">Adicionar foto do dispositivo</button>
      </header>

      {/* TIMELINE (MÊS 2026) */}
      <div className="flex items-center gap-10">
        <h2 className="text-[12rem] font-black italic uppercase tracking-tighter leading-none">Mês</h2>
        <div className="flex-1 h-6 bg-black rounded-full"></div>
        <h2 className="text-[12rem] font-black italic opacity-5 tracking-tighter leading-none">2026</h2>
      </div>

      {/* CALENDÁRIO (OCUPA A ÁREA PRINCIPAL) */}
      <main className="relative">
        <FullCalendar 
          plugins={[daygridPlugin, interactionPlugin]} 
          initialView="dayGridMonth"
          headerToolbar={false}
          locale="pt-br"
          dateClick={() => setModalOpen(true)}
        />
      </main>

      {/* MODAL CENTRALIZADO (ESTILO BALÃO DO TEMPLATE) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.8, y: 100 }} animate={{ scale: 1, y: 0 }}
              className="bg-white neo-border rounded-[80px] neo-shadow p-16 max-w-2xl w-full relative"
            >
              <div className="flex justify-between items-center mb-10 border-b-8 border-black pb-4">
                <h3 className="text-6xl font-black italic uppercase tracking-tighter">Post Agenda</h3>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f5886c] border-4 border-black"></div>
                  <div className="w-10 h-10 rounded-full bg-[#1260c7] border-4 border-black"></div>
                  <div className="w-10 h-10 rounded-full bg-[#ffce0a] border-4 border-black"></div>
                </div>
              </div>

              <div className="space-y-8 font-black italic uppercase">
                <input placeholder="TÍTULO..." className="w-full text-7xl bg-transparent border-b-8 border-black outline-none placeholder:opacity-20" />
                <div className="bg-[#fff9c4] neo-border rounded-[40px] p-8 neo-shadow-sm rotate-[-2deg]">
                  <p className="text-3xl text-blue-700 underline font-mono">4599992869@u.s</p>
                </div>
                <div className="flex gap-10 text-5xl pt-10">
                  <button className="hover:underline decoration-[10px] decoration-yellow-400">SALVAR</button>
                  <button onClick={() => setModalOpen(false)} className="opacity-20">FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
