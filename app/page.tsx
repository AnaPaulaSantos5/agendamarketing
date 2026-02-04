"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Interface para garantir a tipagem correta
interface Evento {
  id: string;
  dia: number;
  titulo: string;
  cor: string;
  whatsapp: string;
}

export default function AgendaPage() {
  // --- ESTADOS DE DADOS ---
  const [eventos, setEventos] = useState<Evento[]>([
    { id: '1', dia: 1, titulo: 'Campanha Verão', cor: '#f5886c', whatsapp: '4599992869@u.s' }
  ]);
  
  // --- ESTADOS DE INTERFACE ---
  const [diaAtivo, setDiaAtivo] = useState<number>(1);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Estado para os inputs do modal
  const [tempEvento, setTempEvento] = useState({ id: '', titulo: '', whatsapp: '4599992869@u.s', cor: '#f5886c' });

  const colors = { orange: '#f5886c', blue: '#1260c7', yellow: '#ffce0a' };

  // --- LÓGICA DE CLIQUE NO DIA ---
  const handleDiaClick = (dia: number) => {
    setDiaAtivo(dia);
    const existente = eventos.find(e => e.dia === dia);
    
    if (existente) {
      setTempEvento({ ...existente });
    } else {
      setTempEvento({ id: '', titulo: '', whatsapp: '4599992869@u.s', cor: '#f5886c' });
    }
    setShowEventModal(true);
  };

  // --- SALVAR EVENTO ---
  const handleSalvar = () => {
    if (tempEvento.id) {
      setEventos(eventos.map(e => e.id === tempEvento.id ? { ...tempEvento, dia: diaAtivo } : e));
    } else {
      const novo: Evento = { ...tempEvento, id: Date.now().toString(), dia: diaAtivo };
      setEventos([...eventos, novo]);
    }
    setShowEventModal(false);
  };

  const cardStyle = { 
    border: '2px solid black', 
    borderRadius: '30px', 
    padding: '20px', 
    backgroundColor: 'white',
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh' }}>
      
      {/* CABEÇALHO - ENGRENAGEM FUNCIONAL */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', gap: '40px', height: '180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '320px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '85px', height: '85px', borderRadius: '50%', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>A</div>
            <Settings 
              size={22} 
              onClick={() => setShowPerfilModal(true)}
              style={{ position: 'absolute', top: -5, left: -5, background: 'white', borderRadius: '50%', border: '1px solid black', padding: '2px', cursor: 'pointer' }} 
            />
            <ChevronDown size={22} style={{ position: 'absolute', right: -10, top: '40%', cursor: 'pointer' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>Editar Cliente</h3>
            <p style={{ fontSize: '14px', margin: '4px 0', color: '#555' }}>Nome do Cliente</p>
          </div>
        </div>
        <div style={{ flex: 3, border: '2px dashed #bbb', height: '100%', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', cursor: 'pointer' }}>
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS / 2026 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid black', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ChevronLeft size={45} className="cursor-pointer" />
          <h1 style={{ fontSize: '75px', margin: 0, fontWeight: '900', letterSpacing: '-5px' }}>FEVEREIRO</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ fontSize: '75px', margin: 0, fontWeight: '300' }}>2026</h1>
          <ChevronRight size={45} className="cursor-pointer" />
        </div>
      </div>

      {/* CALENDÁRIO HORIZONTAL */}
      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
        {[...Array(15)].map((_, i) => {
          const dia = i + 1;
          const evento = eventos.find(e => e.dia === dia);
          return (
            <div 
              key={dia} 
              onClick={() => handleDiaClick(dia)}
              style={{ 
                ...cardStyle, minWidth: '155px', height: '155px', textAlign: 'center', cursor: 'pointer',
                borderColor: diaAtivo === dia ? colors.orange : 'black',
                backgroundColor: diaAtivo === dia ? '#fef3f0' : 'white'
              }}
            >
              <p style={{ fontWeight: 'bold', margin: '0 0 15px 0' }}>DIA {dia}</p>
              {evento && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: evento.cor }}></div>
                  <span style={{ fontSize: '13px', fontStyle: 'italic' }}>evento</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- MODAIS FLUTUANTES (OVERLAYS) --- */}
      <AnimatePresence>
        
        {/* 1. MODAL EDITAR CLIENTE (ENGRENAGEM) */}
        {showPerfilModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ ...cardStyle, width: '500px', boxShadow: '20px 20px 0px black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '30px', fontWeight: '900', fontStyle: 'italic' }}>EDITAR CLIENTE</h2>
                <X style={{ cursor: 'pointer' }} onClick={() => setShowPerfilModal(false)} />
              </div>
              <input style={{ width: '100%', border: 'none', borderBottom: '2px solid black', padding: '10px 0', fontSize: '18px', outline: 'none' }} placeholder="Nome do Cliente" />
              <button onClick={() => setShowPerfilModal(false)} style={{ marginTop: '30px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>SALVAR</button>
            </motion.div>
          </div>
        )}

        {/* 2. MODAL EVENTO (NOVO OU EDITAR) */}
        {showEventModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} style={{ ...cardStyle, width: '500px', boxShadow: '20px 20px 0px black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', fontStyle: 'italic' }}>{tempEvento.id ? 'EDITAR EVENTO' : 'NOVO EVENTO'}</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {Object.values(colors).map(c => (
                    <div key={c} onClick={() => setTempEvento({...tempEvento, cor: c})} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: c, border: '1px solid black', cursor: 'pointer', opacity: tempEvento.cor === c ? 1 : 0.3 }} />
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input 
                  style={{ width: '100%', border: 'none', borderBottom: '2px solid black', padding: '10px 0', fontSize: '24px', fontWeight: 'bold', outline: 'none' }} 
                  placeholder="TÍTULO DO EVENTO" 
                  value={tempEvento.titulo}
                  onChange={(e) => setTempEvento({...tempEvento, titulo: e.target.value})}
                />
                <div style={{ background: '#fff9c4', border: '2px solid black', padding: '20px', borderRadius: '20px' }}>
                   <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>WHATSAPP ID</p>
                   <p style={{ margin: 0, fontSize: '18px', color: '#1260c7', textDecoration: 'underline' }}>{tempEvento.whatsapp}</p>
                </div>
              </div>

              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <button onClick={handleSalvar} style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SALVAR</button>
                {tempEvento.id && <button style={{ background: 'none', border: 'none', fontWeight: 'bold', color: 'red', cursor: 'pointer' }}>EXCLUIR</button>}
                <button onClick={() => setShowEventModal(false)} style={{ background: 'none', border: 'none', fontWeight: 'bold', opacity: 0.3, cursor: 'pointer' }}>FECHAR</button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
