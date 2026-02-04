"use client";

import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function AgendaPage() {
  // Estado para gerenciar qual dia está selecionado e qual modal exibir
  const [diaAtivo, setDiaAtivo] = useState<number | null>(1);
  const [modoEdicao, setModoEdicao] = useState(true);

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
    transition: 'all 0.2s ease-in-out'
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: '0 auto', backgroundColor: 'white', minHeight: '100vh' }}>
      
      {/* CABEÇALHO - EDITAR CLIENTE */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', gap: '40px', height: '180px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '320px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '85px', height: '85px', borderRadius: '50%', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>
              A
            </div>
            <Settings size={22} style={{ position: 'absolute', top: -5, left: -5, background: 'white', borderRadius: '50%', border: '1px solid black', padding: '2px' }} />
            <ChevronDown size={22} style={{ position: 'absolute', right: -10, top: '40%', cursor: 'pointer' }} />
          </div>
          <div style={{ lineHeight: '1.4' }}>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>Editar Cliente</h3>
            <p style={{ fontSize: '14px', margin: '4px 0', color: '#555' }}>Nome do Cliente</p>
            <p style={{ fontSize: '14px', margin: '2px 0', color: '#555' }}>WhatsApp ID (ChatId)</p>
            <p style={{ fontSize: '14px', margin: '2px 0', color: '#555' }}>Email do Google</p>
          </div>
        </div>

        {/* ÁREA DE FOTO AMPLIADA */}
        <div style={{ flex: 3, border: '2px dashed #bbb', height: '100%', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', cursor: 'pointer', fontSize: '18px', fontWeight: '500' }}>
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS / 2026 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid black', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ChevronLeft size={45} style={{ cursor: 'pointer' }} />
          <h1 style={{ fontSize: '75px', margin: 0, fontWeight: '900', letterSpacing: '-5px' }}>MÊS</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ fontSize: '75px', margin: 0, fontWeight: '300' }}>2026</h1>
          <ChevronRight size={45} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* ÁREA PRINCIPAL: CALENDÁRIO + PAINÉIS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
        
        {/* CALENDÁRIO HORIZONTAL */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(dia => (
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
          <p style={{ marginTop: '5px', textAlign: 'left', fontWeight: 'bold', color: '#444', fontSize: '18px', fontStyle: 'italic' }}>
            Clicar e arrastar:
          </p>
        </div>

        {/* MODAIS DE EVENTO LADO A LADO */}
        <div style={{ display: 'flex', gap: '35px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* EDITAR EVENTO */}
          <div style={{ ...cardStyle, width: '400px', boxShadow: '12px 12px 0px black', opacity: modoEdicao ? 1 : 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>EDITAR EVENTO</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: colors.orange, border: '1px solid black' }}></div>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: colors.blue, border: '1px solid black' }}></div>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: colors.yellow, border: '1px solid black' }}></div>
                <Plus size={20} style={{ cursor: 'pointer' }} onClick={() => setModoEdicao(false)} />
              </div>
            </div>
            
            <div style={{ fontSize: '17px', lineHeight: '2.6' }}>
              <p style={{ margin: 0 }}><strong>Início</strong></p>
              <p style={{ margin: 0 }}><strong>Título</strong></p>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>TipoExterno (Notificar) Interno</p>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>WhatsApp ID</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '15px', color: colors.blue }}>4599992869@u.s</p>
              <p style={{ margin: '15px 0 0 0', color: '#aaa', fontStyle: 'italic' }}>Conteúdo Secundário</p>
            </div>

            <div style={{ marginTop: '45px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold' }}>
              <button style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>SALVAR</button>
              <button style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>EXCLUIR</button>
              <button style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>FECHAR</button>
            </div>
          </div>

          <div style={{ alignSelf: 'center', fontWeight: '900', fontSize: '24px' }}>OU</div>

          {/* NOVO EVENTO */}
          <div 
            onClick={() => setModoEdicao(false)}
            style={{ ...cardStyle, width: '400px', opacity: modoEdicao ? 0.3 : 1, border: modoEdicao ? '2px solid #ccc' : '2px solid black', cursor: 'pointer' }}
          >
            <span style={{ fontWeight: 'bold', fontSize: '18px', display: 'block', marginBottom: '25px', color: modoEdicao ? '#999' : 'black' }}>NOVO EVENTO</span>
            <div style={{ fontSize: '17px', lineHeight: '2.6', color: modoEdicao ? '#ccc' : '#444' }}>
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
