"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgendaPage() {
  // --- ESTADOS FUNCIONAIS ---
  const [diaAtivo, setDiaAtivo] = useState<number | null>(1);
  const [modoEdicao, setModoEdicao] = useState(true);
  const [showPerfilModal, setShowPerfilModal] = useState(false); // Controle da Engrenagem
  const [mesAtual, setMesAtual] = useState("FEVEREIRO");
  const [anoAtual, setAnoAtual] = useState(2026);

  const colors = { 
    orange: '#f5886c', 
    blue: '#1260c7', 
    yellow: '#ffce0a', 
    black: '#000000' 
  };

  const cardStyle: React.CSSProperties = { 
    border: '2px solid black', 
    borderRadius: '30px', 
    padding: '20px', 
    backgroundColor: 'white',
    transition: 'all 0.2s ease-in-out'
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Causten, sans-serif', maxWidth: '1400px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh' }}>
      
      {/* CABEÇALHO - FUNCIONALIDADE DA ENGRENAGEM */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', gap: '40px', height: '180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '320px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '85px', height: '85px', borderRadius: '50%', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
              A
            </div>
            {/* CLICK NA ENGRENAGEM ABRE O MODAL */}
            <Settings 
              size={22} 
              onClick={() => setShowPerfilModal(true)}
              style={{ position: 'absolute', top: -5, left: -5, background: 'white', borderRadius: '50%', border: '1px solid black', padding: '2px', cursor: 'pointer' }} 
            />
            <ChevronDown size={22} style={{ position: 'absolute', right: -10, top: '40%', cursor: 'pointer' }} />
          </div>
          <div style={{ lineHeight: '1.4' }}>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>Editar Cliente</h3>
            <p style={{ fontSize: '14px', margin: '4px 0', color: '#555' }}>Nome do Cliente</p>
            <p style={{ fontSize: '14px', margin: '2px 0', color: '#555' }}>WhatsApp ID (ChatId)</p>
            <p style={{ fontSize: '14px', margin: '2px 0', color: '#555' }}>Email do Google</p>
          </div>
        </div>

        <div style={{ flex: 3, border: '2px dashed #bbb', height: '100%', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', cursor: 'pointer', fontSize: '18px', fontWeight: '500' }}>
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS / ANO COM NAVEGAÇÃO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid black', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ChevronLeft size={45} style={{ cursor: 'pointer' }} onClick={() => setMesAtual("JANEIRO")} />
          <h1 style={{ fontSize: '75px', margin: 0, fontWeight: '900', letterSpacing: '-5px' }}>{mesAtual}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ fontSize: '75px', margin: 0, fontWeight: '300' }}>{anoAtual}</h1>
          <ChevronRight size={45} style={{ cursor: 'pointer' }} onClick={() => setMesAtual("MARÇO")} />
        </div>
      </div>

      {/* CALENDÁRIO HORIZONTAL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(dia => (
              <div 
                key={dia} 
                onClick={() => { setDiaAtivo(dia); setModoEdicao(true); }}
                style={{ 
                  ...cardStyle, 
                  minWidth: '155px', 
                  height: '155px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  borderColor: diaAtivo === dia ? colors.orange : 'black',
                  backgroundColor: diaAtivo === dia ? '#fef3f0' : 'white',
                  transform: diaAtivo === dia ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <p style={{ fontWeight: 'bold', margin: '0 0 15px 0', fontSize: '18px' }}>DIA {dia}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: colors.orange }}></div>
                  <span style={{ fontSize: '13px', fontStyle: 'italic', fontWeight: '500' }}>evento</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ÁREA DE MODAIS (GERENCIAMENTO DE EDIÇÃO VS NOVO) */}
        <div style={{ display: 'flex', gap: '35px', alignItems: 'flex-start' }}>
          
          {/* EDITAR EVENTO (ATIVO QUANDO MODOEDICAO É TRUE) */}
          <div style={{ ...cardStyle, width: '450px', boxShadow: modoEdicao ? '12px 12px 0px black' : 'none', opacity: modoEdicao ? 1 : 0.3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>EDITAR EVENTO</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                {Object.values(colors).map(c => <div key={c} style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: c, border: '1px solid black', cursor: 'pointer' }} />)}
                <Plus size={20} style={{ cursor: 'pointer' }} onClick={() => setModoEdicao(false)} />
              </div>
            </div>
            
            <div style={{ lineHeight: '2.4' }}>
              <p style={{ margin: 0, fontWeight: '700' }}>Início</p>
              <input style={{ border: 'none', borderBottom: '1px solid #ddd', width: '100%', outline: 'none', fontSize: '17px' }} placeholder="Data do Evento" />
              <p style={{ margin: '10px 0 0 0', fontWeight: '700' }}>Título</p>
              <input style={{ border: 'none', borderBottom: '1px solid #ddd', width: '100%', outline: 'none', fontSize: '17px' }} placeholder="Nome do Evento" />
              <div style={{ backgroundColor: colors.blue, color: 'white', padding: '15px', borderRadius: '20px', marginTop: '20px' }}>
                <p style={{ margin: 0, fontSize: '14px' }}>WhatsApp ID</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>4599992869@u.s</p>
              </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
              <button style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SALVAR</button>
              <button style={{ background: 'none', border: 'none', fontWeight: 'bold', color: '#ccc' }}>EXCLUIR</button>
              <button style={{ background: 'none', border: 'none', fontWeight: 'bold', color: '#ccc' }}>FECHAR</button>
            </div>
          </div>

          <div style={{ alignSelf: 'center', fontWeight: '900', fontSize: '24px', opacity: 0.1 }}>OU</div>

          {/* NOVO EVENTO (ATIVA AO CLICAR) */}
          <div 
            onClick={() => setModoEdicao(false)}
            style={{ ...cardStyle, width: '450px', opacity: modoEdicao ? 0.3 : 1, boxShadow: !modoEdicao ? '12px 12px 0px black' : 'none', cursor: 'pointer' }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '18px', display: 'block', marginBottom: '25px' }}>NOVO EVENTO</span>
            <p style={{ fontStyle: 'italic', opacity: 0.5 }}>Clique aqui para criar um novo registro...</p>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIGURAÇÃO (ABRE PELA ENGRENAGEM) */}
      <AnimatePresence>
        {showPerfilModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.05)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ ...cardStyle, width: '500px', boxShadow: '20px 20px 0px black' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic' }}>EDITAR CLIENTE</h2>
                <X style={{ cursor: 'pointer' }} onClick={() => setShowPerfilModal(false)} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input style={{ border: 'none', borderBottom: '2px solid black', padding: '10px 0', outline: 'none', fontSize: '18px' }} placeholder="Nome do Cliente" />
                <input style={{ border: 'none', borderBottom: '2px solid black', padding: '10px 0', outline: 'none', fontSize: '18px' }} placeholder="WhatsApp ID" />
                <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
                  <button style={{ fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer' }}>SALVAR</button>
                  <button onClick={() => setShowPerfilModal(false)} style={{ fontWeight: 'bold', border: 'none', background: 'none', cursor: 'pointer', opacity: 0.3 }}>FECHAR</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
