"use client";
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaMarketing() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', whatsapp: '4599992869@u.s' });

  return (
    <div className="min-h-screen p-10 space-y-20 max-w-[1400px] mx-auto">
      
      {/* HEADER: EDITAR CLIENTE (BORDÃO ARREDONDADO) */}
      <header className="sketch-border rounded-[80px] p-10 flex items-center justify-between h-48 relative overflow-hidden">
        <div className="flex items-center gap-10">
          <div className="w-24 h-24 rounded-full border-[6px] border-black flex items-center justify-center text-5xl font-black bg-white">A</div>
          <div className="sketch-border rounded-[35px] p-6 px-12 transform -rotate-1">
            <h1 className="font-black text-4xl uppercase italic leading-none">Editar Cliente</h1>
          </div>
        </div>
        <button className="font-black italic underline text-xl hover:text-blue-600 transition-colors">
          Adicionar foto do dispositivo
        </button>
      </header>

      {/* TIMELINE CENTRAL: MÊS 2026 */}
      <div className="flex items-center gap-10 w-full px-4">
        <h2 className="text-[14rem] font-black italic uppercase tracking-tighter leading-none select-none">Mês</h2>
        <div className="flex-1 h-8 bg-black rounded-full shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]"></div>
        <h2 className="text-[14rem] font-black italic opacity-10 tracking-tighter leading-none select-none">2026</h2>
      </div>

      {/* CALENDÁRIO (DIA / EVENTO) */}
      <main className="relative z-10">
        <FullCalendar 
          plugins={[daygridPlugin, interactionPlugin]} 
          initialView="dayGridMonth"
          headerToolbar={false}
          locale="pt-br"
          dateClick={() => setModalOpen(true)}
        />
      </main>

      {/* MODAL: NOVO EVENTO / EDITAR EVENTO (SOBREPOSTO) */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-6">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="sketch-border rounded-[90px] p-16 max-w-2xl w-full bg-white relative"
            >
              {/* SELETOR DE CORES DA MARCAÇÃO */}
              <div className="flex justify-between items-center mb-12 border-b-[6px] border-black pb-6">
                <h3 className="text-7xl font-black italic uppercase tracking-tighter">Novo Evento</h3>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5886c] border-[5px] border-black shadow-[4px_4px_0px_0px_black] cursor-pointer"></div>
                  <div className="w-12 h-12 rounded-full bg-[#1260c7] border-[5px] border-black shadow-[4px_4px_0px_0px_black] cursor-pointer"></div>
                  <div className="w-12 h-12 rounded-full bg-[#ffce0a] border-[5px] border-black shadow-[4px_4px_0px_0px_black] cursor-pointer"></div>
                </div>
              </div>

              <div className="space-y-12">
                <input 
                  placeholder="DIGITE O TÍTULO..." 
                  className="neo-input w-full text-6xl"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                
                <div className="bg-[#fff9c4] sketch-border rounded-[45px] p-10 transform rotate-[-2deg] neo-shadow-sm">
                  <p className="text-3xl font-mono font-bold text-blue-800 underline break-all">
                    WhatsApp ID: {formData.whatsapp}
                  </p>
                </div>

                <div className="flex gap-12 pt-8">
                  <button className="text-5xl font-black italic hover:underline decoration-[12px] decoration-yellow-400">SALVAR</button>
                  <button onClick={() => setModalOpen(false)} className="text-5xl font-black italic opacity-20 hover:opacity-100 transition-opacity">FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
