"use client";

import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Settings, ChevronLeft, ChevronRight, Plus, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaCausten() {
  const calendarRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [capaImage, setCapaImage] = useState<string | null>(null);

  const colors = { orange: '#f5886c', blue: '#1260c7', yellow: '#ffce0a' };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCapaImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen relative">
      
      {/* HEADER COMO CAPA AMPLA */}
      <header 
        className="relative w-full h-64 mb-16 border-2 border-black rounded-[50px] overflow-hidden bg-gray-50 flex items-center justify-center group cursor-pointer transition-all hover:border-blue-500"
        onClick={() => !capaImage && fileInputRef.current?.click()}
      >
        {/* Imagem de Fundo (Capa) */}
        {capaImage ? (
          <img src={capaImage} className="absolute inset-0 w-full h-full object-cover" alt="Capa" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 font-bold italic">
            <Camera size={40} />
            <span>Adicionar foto do dispositivo</span>
          </div>
        )}

        {/* Overlay para facilitar a leitura se houver capa */}
        {capaImage && <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all" />}

        {/* Elementos de Perfil Flutuantes sobre a Capa */}
        <div className="absolute left-10 bottom-8 flex items-center gap-6 z-10">
          <div className="relative cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowUserModal(true); }}>
            <div className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-4xl font-bold bg-white shadow-xl">
              A
            </div>
            <div className="absolute -top-1 -left-1 bg-white border-2 border-black rounded-full p-2 hover:rotate-90 transition-transform shadow-md">
              <Settings size={20} />
            </div>
          </div>
          <div className="space-y-1">
             <div className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-black rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-lg font-bold uppercase tracking-wider">Perfil Ativo</span>
                <ChevronLeft size={18} />
                <ChevronRight size={18} />
             </div>
          </div>
        </div>

        {/* Botão de trocar foto (visível no hover se já houver capa) */}
        {capaImage && (
          <button 
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="absolute right-8 top-8 bg-white/90 border-2 border-black px-4 py-2 rounded-full font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Trocar Capa
          </button>
        )}

        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
      </header>

      {/* NAVEGAÇÃO TEMPO (MÊS --- ANO) */}
      <div className="flex items-center justify-between mb-10 border-b-2 border-black pb-6">
        <div className="flex items-center gap-6">
          <ChevronLeft className="cursor-pointer" size={40} onClick={() => calendarRef.current.getApi().prev()} />
          <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">Mês</h1>
        </div>
        <div className="flex-1 mx-12 h-[2px] bg-gray-200" />
        <div className="flex items-center gap-6">
          <h1 className="text-8xl font-light tracking-tighter uppercase opacity-20 leading-none">2026</h1>
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

      {/* OVERLAY MODALS */}
      <AnimatePresence>
        {/* MODAL EDITAR CLIENTE */}
        {showUserModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="modal-glass p-12 w-full max-w-xl bg-white border-2 border-black rounded-[50px] shadow-2xl">
              <h2 className="text-4xl font-bold mb-8 italic uppercase">Editar Cliente</h2>
              <div className="space-y-6 text-lg font-causten">
                <input className="w-full border-b-2 border-black py-2 outline-none" placeholder="Nome do Cliente" />
                <input className="w-full border-b-2 border-black py-2 outline-none" placeholder="WhatsApp ID" />
                <div className="flex justify-between pt-10 font-bold uppercase tracking-widest">
                  <button onClick={() => setShowUserModal(false)} className="hover:underline">SALVAR</button>
                  <button onClick={() => setShowUserModal(false)} className="opacity-30">FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL NOVO EVENTO */}
        {showEventModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/5 backdrop-blur-sm">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="modal-glass p-10 w-full max-w-lg relative border-2 border-black bg-white rounded-[50px] shadow-2xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold italic uppercase">Novo Evento</h3>
                <div className="flex gap-3">
                  {Object.values(colors).map(c => <div key={c} className="w-7 h-7 rounded-full border-2 border-black shadow-sm" style={{ backgroundColor: c }} />)}
                </div>
              </div>
              <div className="space-y-8 font-medium">
                <div className="border-b-2 border-black/10 pb-2">
                  <p className="text-[10px] uppercase font-bold opacity-30 tracking-widest">Título</p>
                  <input className="w-full text-3xl font-bold outline-none bg-transparent" placeholder="DIGITE O TÍTULO..." />
                </div>
                <div className="bg-blue-600 text-white p-6 rounded-[30px] flex justify-between items-center shadow-lg">
                  <span className="font-mono text-xl">4599992869@u.s</span>
                </div>
                <div className="flex justify-between pt-6 font-bold text-sm tracking-widest uppercase">
                  <button className="hover:underline decoration-4">SALVAR</button>
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
