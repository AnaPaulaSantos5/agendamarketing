"use client";
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaProfissional() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dataSelecionada, setDataSelecionada] = useState("");

  return (
    <div className="p-8 md:p-16 space-y-12 max-w-[1200px] mx-auto">
      
      {/* HEADER: EDITAR CLIENTE */}
      <header className="neo-container p-8 flex items-center justify-between h-40">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-[5px] border-black flex items-center justify-center text-4xl font-black bg-white">A</div>
          <div className="border-[5px] border-black rounded-[25px] p-4 bg-white shadow-[6px_6px_0px_0px_black]">
            <h1 className="font-black text-2xl uppercase italic">Editar Cliente</h1>
          </div>
        </div>
        <button className="font-bold underline italic text-sm">Adicionar foto do dispositivo</button>
      </header>

      {/* TÍTULO CENTRAL: MÊS 2026 */}
      <div className="flex items-center gap-6 overflow-hidden">
        <h2 className="text-[10rem] font-black italic uppercase tracking-tighter leading-none">Mês</h2>
        <div className="flex-1 h-5 bg-black rounded-full min-w-[50px]"></div>
        <h2 className="text-[10rem] font-black italic opacity-10 tracking-tighter leading-none">2026</h2>
      </div>

      {/* CALENDÁRIO INTERATIVO */}
      <main className="relative">
        <FullCalendar 
          plugins={[daygridPlugin, interactionPlugin]} 
          initialView="dayGridMonth"
          headerToolbar={false}
          locale="pt-br"
          dateClick={(arg: any) => {
            setDataSelecionada(arg.dateStr);
            setModalOpen(true);
          }}
        />
      </main>

      {/* MODAL: NOVO EVENTO (SÓ APARECE AO CLICAR) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.8, y: 100 }} animate={{ scale: 1, y: 0 }}
              className="neo-container p-12 max-w-xl w-full relative bg-white"
            >
              <h3 className="text-5xl font-black italic uppercase mb-10 border-b-8 border-black pb-4">Novo Evento</h3>
              
              <div className="space-y-8">
                <input placeholder="TÍTULO..." className="neo-input w-full text-5xl" />
                
                <div className="bg-[#fff9c4] border-[5px] border-black p-6 rounded-[35px] shadow-[8px_8px_0px_0px_black] rotate-[-1deg]">
                  <p className="text-2xl text-blue-700 underline font-mono font-bold">4599992869@u.s</p>
                </div>

                <div className="flex gap-10 pt-6">
                  <button className="text-4xl font-black hover:underline decoration-yellow-400 decoration-8">SALVAR</button>
                  <button onClick={() => setModalOpen(false)} className="text-4xl font-black opacity-20">FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
