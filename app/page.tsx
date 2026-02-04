"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function AgendaPage() {
  const [diaAtivo, setDiaAtivo] = useState<number | null>(1);

  const colors = { 
    orange: '#f5886c', 
    blue: '#1260c7', 
    yellow: '#ffce0a', 
    black: '#000000' 
  };

  const cardStyle = { 
    border: '2px solid black', 
    borderRadius: '30px', 
    padding: '20px', 
    backgroundColor: 'white',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh' }}>
      
      {/* CABEÇALHO - EDITAR CLIENTE */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', gap: '40px', height: '180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '300px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
              A
            </div>
            <Settings size={22} style={{ position: 'absolute', top: -5, left: -5, background: 'white', borderRadius: '50%', border: '1px solid black', padding: '2px' }} />
            <ChevronDown size={22} style={{ position: 'absolute', right: -10, top: '40%', cursor: 'pointer' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Editar Cliente</h3>
            <p style={{ fontSize: '14px', margin: '4px 0', color: '#666' }}>Nome do Cliente</p>
            <p style={{ fontSize: '14px', margin: '2px 0', color: '#666' }}>WhatsApp ID (ChatId)</p>
            <p style={{ fontSize: '14px', margin: '2px 0', color: '#666' }}>Email do Google</p>
          </div>
        </div>

        {/* ÁREA DE IMAGEM AMPLIADA */}
        <div style={{ flex: 2, border: '2px dashed #ccc', height: '100%', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', cursor: 'pointer', fontSize: '18px' }}>
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS / 2026 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ChevronLeft size={45} style={{ cursor: 'pointer' }} />
          <h1 style={{ fontSize: '70px', margin: 0, fontWeight: '900', letterSpacing: '-4px' }}>MÊS</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ fontSize: '70px', margin: 0, fontWeight: '300' }}>2026</h1>
          <ChevronRight size={45} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* CALENDÁRIO HORIZONTAL (DIAS LADO A LADO) */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollBehavior: 'smooth' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(dia => (
              <div 
                key={dia} 
                onClick={() => setDiaAtivo(dia)}
                style={{ 
                  ...cardStyle, 
                  minWidth: '150px', 
                  height: '150px', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  backgroundColor: diaAtivo === dia ? '#fef3f0' : 'white',
                  borderColor: diaAtivo === dia ? colors.orange : 'black',
                  transform: diaAtivo === dia ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <p style={{ fontWeight: 'bold', margin: '0 0 15px 0', fontSize: '16px' }}>DIA {dia}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors.orange }}></div>
                  <span style={{ fontSize: '12px', fontStyle: 'italic' }}>evento</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '5px', textAlign: 'left', fontWeight: 'bold', color: '#333', fontSize: '16px' }}>
            {"--- Clicar e arrastar ---"}
          </p>
        </div>

        {/* PAINÉIS LATERAIS */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* EDITAR EVENTO */}
          <div style={{ ...cardStyle, width: '380px', boxShadow: '10px 10px 0px black' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>EDITAR EVENTO</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: colors.orange, cursor: 'pointer', border: '1px solid black' }}></div>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: colors.blue, cursor: 'pointer', border: '1px solid black' }}></div>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: colors.yellow, cursor: 'pointer', border: '1px solid black' }}></div>
                <Plus size={18} style={{ cursor: 'pointer' }} />
              </div>
            </div>
            
            <div style={{ fontSize: '16px', lineHeight: '2.5' }}>
              <p style={{ margin: 0 }}><strong>Início</strong></p>
              <p style={{ margin: 0 }}><strong>Título</strong></p>
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>TipoExterno (Notificar) Interno</p>
              <p style={{ margin: '10px 0 0 0', fontSize: '13px', color: '#555' }}>WhatsApp ID</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: colors.blue }}>4599992869@u.s</p>
              <p style={{ margin: '15px 0 0 0', color: '#999' }}>Conteúdo Secundário</p>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold' }}>
              <button style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SALVAR</button>
              <button style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>EXCLUIR</button>
              <button style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>FECHAR</button>
            </div>
          </div>

          <div style={{ alignSelf: 'center', fontWeight: '900', fontSize: '20px', color: '#000' }}>OU</div>

          {/* NOVO EVENTO */}
          <div style={{ ...cardStyle, width: '380px', opacity: 0.3, border: '2px solid #ccc' }}>
            <span style={{ fontWeight: 'bold', fontSize: '16px', display: 'block', marginBottom: '25px', color: '#999' }}>NOVO EVENTO</span>
            <div style={{ fontSize: '16px', lineHeight: '2.5', color: '#ccc' }}>
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
