"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaPage() {
  // --- ESTADOS DE DADOS ---
  const [diaAtivo, setDiaAtivo] = useState<number>(1);
  const [modoEdicao, setModoEdicao] = useState(true);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [mesIndex, setMesIndex] = useState(1); // 1 = Fevereiro
  const [anoAtual, setAnoAtual] = useState(2026);
  const [corSelecionada, setCorSelecionada] = useState('#f5886c');

  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

  const colors = { orange: '#f5886c', blue: '#1260c7', yellow: '#ffce0a', black: '#000000' };

  // Funções de Navegação
  const proximoMes = () => {
    if (mesIndex === 11) { setMesIndex(0); setAnoAtual(anoAtual + 1); } 
    else { setMesIndex(mesIndex + 1); }
  };
  const mesAnterior = () => {
    if (mesIndex === 0) { setMesIndex(11); setAnoAtual(anoAtual - 1); } 
    else { setMesIndex(mesIndex - 1); }
  };

  const cardStyle: React.CSSProperties = { 
    border: '2px solid black', 
    borderRadius: '35px', 
    padding: '24px', 
    backgroundColor: 'white',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div className="p-10 max-w-[1450px] mx-auto bg-white min-h-screen font-sans antialiased">
      
      {/* CABEÇALHO - PERFIL E ENGRENAGEM */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '50px', height: '180px' }}>
        <div className="flex items-center gap-8 min-w-[380px]">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center text-4xl font-black bg-gray-50">
              A
            </div>
            <button 
              onClick={() => setShowPerfilModal(true)}
              className="absolute -top-2 -left-2 bg-white border border-black rounded-full p-2 hover:bg-black hover:text-white transition-all"
            >
              <Settings size={22} />
            </button>
            <ChevronDown size={24} className="absolute -right-5 top-1/2 -translate-y-1/2 cursor-pointer text-black/20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Editar Cliente</h3>
            <p className="text-sm font-medium opacity-40 uppercase tracking-widest">Configurações de Perfil</p>
          </div>
        </div>

        {/* ÁREA DE FOTO DISPOSITIVO */}
        <div className="flex-1 border-2 border-dashed border-black/10 h-full rounded-[30px] flex items-center justify-center text-black/20 font-bold italic text-xl hover:border-black hover:text-black transition-all cursor-pointer">
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS / ANO COM LINHA DE CONEXÃO */}
      <div className="flex justify-between items-center mb-12 group">
        <div className="flex items-center gap-8">
          <ChevronLeft size={55} strokeWidth={3} className="cursor-pointer hover:scale-125 transition-transform" onClick={mesAnterior} />
          <h1 className="text-9xl font-black italic tracking-tighter uppercase leading-none">{meses[mesIndex]}</h1>
        </div>
        <div className="flex-1 mx-16 h-1 bg-black rounded-full" />
        <div className="flex items-center gap-8">
          <h1 className="text-9xl font-light tracking-tighter uppercase leading-none opacity-10">{anoAtual}</h1>
          <ChevronRight size={55} strokeWidth={3} className="cursor-pointer hover:scale-125 transition-transform" onClick={proximoMes} />
        </div>
      </div>

      {/* CALENDÁRIO HORIZONTAL (SISTEMA DE BOLHAS) */}
      <div className="mb-14">
        <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar scroll-smooth">
          {[...Array(20)].map((_, i) => {
            const dia = i + 1;
            const isSelected = diaAtivo === dia;
            return (
              <div 
                key={dia} 
                onClick={() => { setDiaAtivo(dia); setModoEdicao(true); }}
                style={{ 
                  ...cardStyle, 
                  minWidth: '170px', 
                  height: '170px', 
                  borderColor: isSelected ? corSelecionada : 'black',
                  backgroundColor: isSelected ? `${corSelecionada}10` : 'white',
                  transform: isSelected ? 'translateY(-10px)' : 'none',
                  boxShadow: isSelected ? `0 15px 30px -10px ${corSelecionada}40` : 'none'
                }}
                className="cursor-pointer group"
              >
                <p className="font-black text-2xl mb-4 italic uppercase">Dia {dia}</p>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: isSelected ? corSelecionada : '#eee' }} />
                  <span className="text-xs font-bold italic opacity-30 group-hover:opacity-100 transition-opacity uppercase">Status</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ÁREA DE MODAIS LADO A LADO */}
      <div className="flex gap-12 items-start">
        
        {/* PAINEL EDITAR EVENTO */}
        <div style={{ 
          ...cardStyle, 
          width: '500px', 
          boxShadow: modoEdicao ? '15px 15px 0px black' : 'none',
          opacity: modoEdicao ? 1 : 0.3,
          pointerEvents: modoEdicao ? 'auto' : 'none'
        }}>
          <div className="flex justify-between items-center mb-10">
            <span className="font-black text-2xl italic uppercase tracking-tighter">Editar Evento</span>
            <div className="flex gap-3 items-center">
              {Object.entries(colors).map(([name, code]) => (
                <div 
                  key={name} 
                  onClick={() => setCorSelecionada(code)}
                  style={{ backgroundColor: code }} 
                  className={`w-7 h-7 rounded-full border-2 border-black cursor-pointer transition-transform ${corSelecionada === code ? 'scale-125' : 'hover:scale-110'}`} 
                />
              ))}
              <Plus size={24} className="ml-4 cursor-pointer text-black/30 hover:text-black" onClick={() => setModoEdicao(false)} />
            </div>
          </div>
          
          <div className="space-y-8 font-bold italic">
            <div className="border-b-2 border-black/5 pb-2">
              <p className="text-[10px] opacity-20 uppercase mb-1">Início</p>
              <input className="w-full bg-transparent text-xl outline-none" defaultValue={`Dia ${diaAtivo} de ${meses[mesIndex]}`} />
            </div>
            <div className="border-b-2 border-black/5 pb-2">
              <p className="text-[10px] opacity-20 uppercase mb-1">Título</p>
              <input className="w-full bg-transparent text-3xl outline-none placeholder:opacity-20 uppercase" placeholder="Nome do Evento" />
            </div>
            <div style={{ backgroundColor: corSelecionada }} className="p-6 rounded-[25px] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
              <p className="text-xs uppercase font-black mb-1">WhatsApp ID</p>
              <p className="text-2xl font-mono underline">4599992869@u.s</p>
            </div>
          </div>

          <div className="mt-12 flex justify-between font-black text-sm tracking-widest italic">
            <button className="hover:underline decoration-4">SALVAR</button>
            <button className="opacity-20 hover:opacity-100">EXCLUIR</button>
            <button className="opacity-20 hover:opacity-100">FECHAR</button>
          </div>
        </div>

        <div className="self-center font-black text-4xl opacity-5 italic select-none">OU</div>

        {/* PAINEL NOVO EVENTO */}
        <div 
          onClick={() => setModoEdicao(false)}
          style={{ 
            ...cardStyle, 
            width: '500px', 
            opacity: !modoEdicao ? 1 : 0.3, 
            boxShadow: !modoEdicao ? '15px 15px 0px black' : 'none',
            cursor: 'pointer'
          }}
          className="group"
        >
          <span className="font-black text-2xl block mb-10 italic uppercase tracking-tighter">Novo Evento</span>
          <div className="space-y-6 opacity-30 italic group-hover:opacity-100 transition-opacity">
            <p className="text-3xl border-b-2 border-black/5">Início</p>
            <p className="text-3xl border-b-2 border-black/5">Título</p>
            <p className="text-xl">WhatsApp ID...</p>
          </div>
        </div>
      </div>

      {/* MODAL DE PERFIL (ABRE PELA ENGRENAGEM) */}
      <AnimatePresence>
        {showPerfilModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ ...cardStyle, width: '550px', boxShadow: '25px 25px 0px black' }}>
              <div className="flex justify-between items-center mb-10 pb-4 border-b-4 border-black">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter">Editar Cliente</h2>
                <X className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => setShowPerfilModal(false)} />
              </div>
              <div className="flex flex-col gap-10">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase opacity-30">Nome do Cliente</p>
                  <input className="w-full border-b-4 border-black bg-transparent text-3xl font-black italic outline-none" placeholder="Ana Paula..." />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase opacity-30">WhatsApp ID</p>
                  <input className="w-full border-b-4 border-black bg-transparent text-3xl font-black italic outline-none" placeholder="ID do Chat" />
                </div>
                <div className="flex gap-10 pt-6 font-black text-2xl italic tracking-tighter uppercase">
                  <button className="hover:underline decoration-8 decoration-yellow-400">Salvar Alterações</button>
                  <button onClick={() => setShowPerfilModal(false)} className="opacity-20 hover:opacity-100">Cancelar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
