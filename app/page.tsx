"use client";

import React, { useState, useMemo } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Evento {
  id: string;
  dataKey: string; // Chave única para o dia (ex: "2026-02-04")
  titulo: string;
  cor: string;
  whatsapp: string;
}

export default function AgendaPage() {
  // --- ESTADOS ---
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [dataAtiva, setDataAtiva] = useState(new Date(2026, 1, 4)); // Começa em 4 de Fev de 2026
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [tempEvento, setTempEvento] = useState({ id: '', titulo: '', whatsapp: '4599992869@u.s', cor: '#f5886c' });

  const colors = { orange: '#f5886c', blue: '#1260c7', yellow: '#ffce0a' };

  // --- LÓGICA DE CALENDÁRIO DINÂMICO ---
  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  
  const diasNoMes = useMemo(() => {
    const ano = dataAtiva.getFullYear();
    const mes = dataAtiva.getMonth();
    return new Date(ano, mes + 1, 0).getDate();
  }, [dataAtiva]);

  const mudarMes = (direcao: number) => {
    setDataAtiva(prev => new Date(prev.getFullYear(), prev.getMonth() + direcao, 1));
  };

  const handleDiaClick = (dia: number) => {
    const dataKey = `${dataAtiva.getFullYear()}-${dataAtiva.getMonth() + 1}-${dia}`;
    const existente = eventos.find(e => e.dataKey === dataKey);
    
    setTempEvento(existente ? { ...existente } : { id: '', titulo: '', whatsapp: '4599992869@u.s', cor: '#f5886c' });
    setShowEventModal(true);
    // Atualiza apenas o dia na data ativa para visual
    setDataAtiva(prev => new Date(prev.getFullYear(), prev.getMonth(), dia));
  };

  const handleSalvar = () => {
    const dataKey = `${dataAtiva.getFullYear()}-${dataAtiva.getMonth() + 1}-${dataAtiva.getDate()}`;
    if (tempEvento.id) {
      setEventos(eventos.map(e => e.id === tempEvento.id ? { ...tempEvento, dataKey } : e));
    } else {
      const novo: Evento = { ...tempEvento, id: Date.now().toString(), dataKey };
      setEventos([...eventos, novo]);
    }
    setShowEventModal(false);
  };

  const cardStyle = { border: '2px solid black', borderRadius: '30px', padding: '20px', backgroundColor: 'white' };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh' }}>
      
      {/* CABEÇALHO */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', height: '180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '320px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '85px', height: '85px', borderRadius: '50%', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>A</div>
            <Settings size={22} onClick={() => setShowPerfilModal(true)} style={{ position: 'absolute', top: -5, left: -5, background: 'white', borderRadius: '50%', border: '1px solid black', padding: '2px', cursor: 'pointer' }} />
            <ChevronDown size={22} style={{ position: 'absolute', right: -10, top: '40%' }} />
          </div>
          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>Editar Cliente</h3>
        </div>
        <div style={{ flex: 3, border: '2px dashed #bbb', height: '100%', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', cursor: 'pointer' }}>
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS / ANO DINÂMICO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid black', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ChevronLeft size={45} className="cursor-pointer" onClick={() => mudarMes(-1)} />
          <h1 style={{ fontSize: '75px', margin: 0, fontWeight: '900', letterSpacing: '-5px' }}>{meses[dataAtiva.getMonth()]}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ fontSize: '75px', margin: 0, fontWeight: '300' }}>{dataAtiva.getFullYear()}</h1>
          <ChevronRight size={45} className="cursor-pointer" onClick={() => mudarMes(1)} />
        </div>
      </div>

      {/* CALENDÁRIO HORIZONTAL DINÂMICO */}
      <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }} className="no-scrollbar">
        {[...Array(diasNoMes)].map((_, i) => {
          const dia = i + 1;
          const key = `${dataAtiva.getFullYear()}-${dataAtiva.getMonth() + 1}-${dia}`;
          const evento = eventos.find(e => e.dataKey === key);
          const isAtivo = dataAtiva.getDate() === dia;

          return (
            <div 
              key={dia} 
              onClick={() => handleDiaClick(dia)}
              style={{ 
                ...cardStyle, minWidth: '155px', height: '155px', textAlign: 'center', cursor: 'pointer',
                borderColor: isAtivo ? colors.orange : 'black',
                backgroundColor: isAtivo ? '#fef3f0' : 'white'
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

      <AnimatePresence>
        {/* MODAL EDITAR CLIENTE */}
        {showPerfilModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ ...cardStyle, width: '500px', boxShadow: '20px 20px 0px black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '30px', fontWeight: '900', fontStyle: 'italic' }}>EDITAR CLIENTE</h2>
                <X style={{ cursor: 'pointer' }} onClick={() => setShowPerfilModal(false)} />
              </div>
              <input style={{ width: '100%', border: 'none', borderBottom: '2px solid black', padding: '10px 0', outline: 'none' }} placeholder="Nome do Cliente" />
              <button onClick={() => setShowPerfilModal(false)} style={{ marginTop: '30px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>SALVAR</button>
            </motion.div>
          </div>
        )}

        {/* MODAL EVENTO */}
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
              <input 
                style={{ width: '100%', border: 'none', borderBottom: '2px solid black', padding: '10px 0', fontSize: '24px', fontWeight: 'bold', outline: 'none', marginBottom: '20px' }} 
                placeholder="TÍTULO DO EVENTO" 
                value={tempEvento.titulo}
                onChange={(e) => setTempEvento({...tempEvento, titulo: e.target.value})}
              />
              <div style={{ background: '#fff9c4', border: '2px solid black', padding: '20px', borderRadius: '20px' }}>
                <p style={{ margin: 0, fontSize: '18px', color: '#1260c7', textDecoration: 'underline' }}>{tempEvento.whatsapp}</p>
              </div>
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <button onClick={handleSalvar}>SALVAR</button>
                <button onClick={() => setShowEventModal(false)} style={{ opacity: 0.3 }}>FECHAR</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
