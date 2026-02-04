"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function AgendaPage() {
  // Estado para selecionar o dia e abrir o painel lateral
  const [diaAtivo, setDiaAtivo] = useState<number | null>(null);

  // Cores oficiais da sua marca
  const colors = { 
    orange: '#f5886c', 
    blue: '#1260c7', 
    yellow: '#ffce0a', 
    black: '#000000' 
  };

  // Estilos base para fidelidade ao wireframe
  const cardStyle = { 
    border: '2px solid black', 
    borderRadius: '30px', 
    padding: '20px', 
    backgroundColor: 'white',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#fdfaf5', minHeight: '100vh' }}>
      
      {/* CABEÇALHO - EDITAR CLIENTE */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              A
            </div>
            <Settings size={18} style={{ position: 'absolute', top: -5, left: -5, background: 'white', borderRadius: '50%', border: '1px solid black' }} />
            <ChevronDown size={18} style={{ position: 'absolute', right: -5, top: '40%' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 'bold' }}>Editar Cliente</h3>
            <p style={{ fontSize: '12px', margin: '2px 0', color: '#666' }}>Nome do Cliente</p>
            <p style={{ fontSize: '12px', margin: '2px 0', color: '#666' }}>WhatsApp ID (ChatId)</p>
          </div>
        </div>
        <div style={{ flex: 1, border: '2px dashed #ccc', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', cursor: 'pointer' }}>
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS / 2026 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ChevronLeft size={40} style={{ cursor: 'pointer' }} />
          <h1 style={{ fontSize: '50px', margin: 0, fontWeight: '900', letterSpacing: '-2px' }}>MÊS</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '50px', margin: 0, fontWeight: '300' }}>2026</h1>
          <ChevronRight size={40} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* ÁREA PRINCIPAL: CALENDÁRIO + PAINÉIS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* CALENDÁRIO HORIZONTAL */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '15px', scrollSnapType: 'x mandatory' }}>
            {[1, 2, 3, 4, 5, 6, 7].map(dia => (
              <div 
                key={dia} 
                onClick={() => setDiaAtivo(dia)}
                style={{ 
                  ...cardStyle, 
                  minWidth: '140px', 
                  height: '140px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  scrollSnapAlign: 'start',
                  backgroundColor: diaAtivo === dia ? '#fff5f2' : 'white',
                  borderColor: diaAtivo === dia ? colors.orange : 'black'
                }}
              >
                <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '14px' }}>DIA {dia}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors.orange }}></div>
                  <span style={{ fontSize: '11px', fontStyle: 'italic' }}>evento</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '10px', textAlign: 'left', fontWeight: 'bold', color: '#aaa', fontStyle: 'italic' }}>
            {"Clicar e arrastar:"}
          </p>
        </div>

        {/* PAINÉIS DE EVENTO LADO A LADO */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* PAINEL EDITAR EVENTO */}
          <div style={{ ...cardStyle, width: '300px', boxShadow: '8px 8px 0px black' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>EDITAR EVENTO</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: colors.orange, cursor: 'pointer' }}></div>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: colors.blue, cursor: 'pointer' }}></div>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: colors.yellow, cursor: 'pointer' }}></div>
                <Plus size={14} style={{ cursor: 'pointer' }} />
              </div>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '2.2' }}>
              <p style={{ margin: 0 }}><strong>Início</strong></p>
              <p style={{ margin: 0 }}><strong>Título</strong></p>
              <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>TipoExterno (Notificar) Interno</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#888' }}>WhatsApp ID</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px', color: colors.blue }}>4599992869@u.s</p>
              <p style={{ margin: '10px 0 0 0', color: '#aaa' }}>Conteúdo Secundário</p>
            </div>
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              <span>SALVAR</span> <span>EXCLUIR</span> <span>FECHAR</span>
            </div>
          </div>

          <div style={{ alignSelf: 'center', fontWeight: 'bold', color: '#ccc' }}>OU</div>

          {/* PAINEL NOVO EVENTO (ESTADO PADRÃO) */}
          <div style={{ ...cardStyle, width: '300px', opacity: 0.4 }}>
            <span style={{ fontWeight: 'bold', fontSize: '12px', display: 'block', marginBottom: '20px' }}>NOVO EVENTO</span>
            <div style={{ fontSize: '14px', lineHeight: '2.2', color: '#999' }}>
              <p>Início</p>
              <p>Título</p>
              <p>TipoExterno...</p>
              <p>WhatsApp ID</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
