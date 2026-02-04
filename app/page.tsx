"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Evento {
  id: string;
  dataKey: string; 
  titulo: string;
  cor: string;
  whatsapp: string;
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [dataAtiva, setDataAtiva] = useState(new Date(2026, 1, 4)); 
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [tempEvento, setTempEvento] = useState({ id: '', titulo: '', whatsapp: '4599992869@u.s', cor: '#f5886c' });
  
  // ESTADO PARA A CAPA
  const [capaImage, setCapaImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = { orange: '#f5886c', blue: '#1260c7', yellow: '#ffce0a' };
  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const diasSemana = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  const diasNoMes = useMemo(() => {
    return new Date(dataAtiva.getFullYear(), dataAtiva.getMonth() + 1, 0).getDate();
  }, [dataAtiva]);

  const primeiroDiaSemana = useMemo(() => {
    return new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), 1).getDay();
  }, [dataAtiva]);

  const mudarMes = (direcao: number) => {
    setDataAtiva(prev => new Date(prev.getFullYear(), prev.getMonth() + direcao, 1));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapaImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiaClick = (dia: number) => {
    const dataKey = `${dataAtiva.getFullYear()}-${dataAtiva.getMonth() + 1}-${dia}`;
    const existente = eventos.find(e => e.dataKey === dataKey);
    setDataAtiva(new Date(dataAtiva.getFullYear(), dataAtiva.getMonth(), dia));
    setTempEvento(existente ? { ...existente } : { id: '', titulo: '', whatsapp: '4599992869@u.s', cor: '#f5886c' });
    setShowEventModal(true);
  };

  const handleSalvar = () => {
    const dataKey = `${dataAtiva.getFullYear()}-${dataAtiva.getMonth() + 1}-${dataAtiva.getDate()}`;
    if (tempEvento.id) {
      setEventos(eventos.map(e => e.id === tempEvento.id ? { ...tempEvento, dataKey } : e));
    } else {
      setEventos([...eventos, { ...tempEvento, id: Date.now().toString(), dataKey }]);
    }
    setShowEventModal(false);
  };

  const cardStyle = { border: '2px solid black', borderRadius: '30px', padding: '20px', backgroundColor: 'white' };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh' }}>
      
      {/* CABEÇALHO COM CAPA INTEGRADA */}
      <div style={{ 
        ...cardStyle, 
        position: 'relative',
        marginBottom: '40px', 
        height: '320px', // Altura otimizada para visual de capa
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '30px'
      }}>
        
        {/* ÁREA DA CAPA (FUNDO) */}
        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            zIndex: 0,
            backgroundImage: capaImage ? `url(${capaImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#f9f9f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {!capaImage && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ccc' }}>
              <Camera size={48} />
              <span style={{ fontWeight: 'bold', marginTop: '10px' }}>Adicionar foto do dispositivo</span>
            </div>
          )}
        </div>

        {/* ELEMENTOS DE PERFIL (SOBRE A CAPA) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', zIndex: 1, position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '3px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold', backgroundColor: 'white', shadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
              A
            </div>
            <Settings size={26} onClick={(e) => { e.stopPropagation(); setShowPerfilModal(true); }} style={{ position: 'absolute', top: -5, left: -5, background: 'white', borderRadius: '50%', border: '2px solid black', padding: '3px', cursor: 'pointer' }} />
            <ChevronDown size={26} style={{ position: 'absolute', right: -15, top: '40%', cursor: 'pointer', color: 'black', background: 'white', borderRadius: '50%', border: '1px solid black' }} />
          </div>
          <div style={{ background: 'white', padding: '10px 20px', borderRadius: '20px', border: '2px solid black', boxShadow: '4px 4px 0px black' }}>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Editar Cliente</h3>
          </div>
        </div>
      </div>

      {/* TÍTULO MÊS / ANO */}
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

      {/* GRADE DE DIAS DA SEMANA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginBottom: '10px', textAlign: 'center' }}>
        {diasSemana.map(d => <div key={d} style={{ fontWeight: '900', fontSize: '14px', opacity: 0.3 }}>{d}</div>)}
      </div>

      {/* CALENDÁRIO COMPLETO (GRID) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px' }}>
        {Array.from({ length: primeiroDiaSemana }).map((_, i) => <div key={`empty-${i}`} />)}
        
        {Array.from({ length: diasNoMes }, (_, i) => {
          const dia = i + 1;
          const key = `${dataAtiva.getFullYear()}-${dataAtiva.getMonth() + 1}-${dia}`;
          const evento = eventos.find(e => e.dataKey === key);
          const isAtivo = dataAtiva.getDate() === dia;

          return (
            <div 
              key={dia} 
              onClick={() => handleDiaClick(dia)}
              style={{ 
                ...cardStyle, height: '160px', textAlign: 'center', cursor: 'pointer',
                borderColor: isAtivo ? colors.orange : 'black',
                backgroundColor: isAtivo ? '#fef3f0' : 'white',
                display: 'flex', flexDirection: 'column', justifyContent: 'center'
              }}
            >
              <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '20px' }}>{dia}</p>
              {evento && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: evento.cor }}></div>
                  <span style={{ fontSize: '11px', fontStyle: 'italic', fontWeight: 'bold' }}>evento</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAIS */}
      <AnimatePresence>
        {showPerfilModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ ...cardStyle, width: '500px', boxShadow: '20px 20px 0px black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '30px', fontWeight: '900', fontStyle: 'italic' }}>EDITAR CLIENTE</h2>
                <X style={{ cursor: 'pointer' }} onClick={() => setShowPerfilModal(false)} />
              </div>
              <input style={{ width: '100%', border: 'none', borderBottom: '2px solid black', padding: '10px 0', outline: 'none', fontSize: '18px' }} placeholder="Nome do Cliente" />
              <button onClick={() => setShowPerfilModal(false)} style={{ marginTop: '30px', fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px' }}>SALVAR</button>
            </motion.div>
          </div>
        )}

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
                style={{ width: '100%', border: 'none', borderBottom: '2px solid black', padding: '10px 0', fontSize: '24px', fontWeight: 'bold', outline: 'none', marginBottom: '20px', textTransform: 'uppercase' }} 
                placeholder="TÍTULO DO EVENTO" 
                value={tempEvento.titulo}
                onChange={(e) => setTempEvento({...tempEvento, titulo: e.target.value})}
              />
              <div style={{ background: '#fff9c4', border: '2px solid black', padding: '20px', borderRadius: '20px' }}>
                <p style={{ margin: 0, fontSize: '18px', color: '#1260c7', textDecoration: 'underline', fontWeight: 'bold' }}>{tempEvento.whatsapp}</p>
              </div>
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <button onClick={handleSalvar} style={{ fontSize: '16px', cursor: 'pointer' }}>SALVAR</button>
                <button onClick={() => setShowEventModal(false)} style={{ opacity: 0.3, fontSize: '16px', cursor: 'pointer' }}>FECHAR</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
