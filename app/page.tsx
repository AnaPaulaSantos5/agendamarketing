"use client";

import React from 'react';
import { Settings, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function AgendaPage() {
  const colors = { orange: '#f5886c', blue: '#1260c7', yellow: '#ffce0a', black: '#000000' };

  // Estilos base para garantir o visual do template
  const cardStyle = { border: '2px solid black', borderRadius: '30px', padding: '20px', backgroundColor: 'white' };
  const flexRow = { display: 'flex', flexDirection: 'row' as const, alignItems: 'center', gap: '20px' };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* CABEÇALHO - EDITAR CLIENTE */}
      <div style={{ ...cardStyle, ...flexRow, marginBottom: '40px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', relative: 'true' } as any}>
            A
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 'bold' }}>Editar Cliente</h3>
            <p style={{ fontSize: '12px', margin: '2px 0' }}>Nome do Cliente</p>
            <p style={{ fontSize: '12px', margin: '2px 0' }}>WhatsApp ID (ChatId)</p>
          </div>
        </div>
        <div style={{ flex: 1, border: '2px dashed #ccc', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', marginLeft: '40px' }}>
          Adicionar foto do dispositivo
        </div>
      </div>

      {/* TÍTULO MÊS / 2026 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid black', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ChevronLeft size={40} />
          <h1 style={{ fontSize: '60px', margin: 0, fontWeight: '900' }}>MÊS</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '60px', margin: 0, fontWeight: '300' }}>2026</h1>
          <ChevronRight size={40} />
        </div>
      </div>

      {/* GRID DE DIAS E PAINÉIS LATERAIS */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* CALENDÁRIO */}
        <div style={{ flex: 2 }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5].map(dia => (
              <div key={dia} style={{ ...cardStyle, width: '120px', height: '120px', textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 10px 0' }}>DIA {dia}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors.orange }}></div>
                  <span style={{ fontSize: '10px', fontStyle: 'italic' }}>evento</span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold' }}>{"<--- Clicar e arrastar --->"}</p>
        </div>

        {/* PAINÉIS DE EVENTO */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ ...cardStyle, width: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '12px' }}>EDITAR EVENTO</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors.orange }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors.blue }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors.yellow }}></div>
              </div>
            </div>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <p>Início</p>
              <p>Título</p>
              <p style={{ color: '#666' }}>WhatsApp ID</p>
              <p style={{ fontWeight: 'bold', fontSize: '11px' }}>4599992869@u.s</p>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold' }}>
              <span>SALVAR</span> <span>EXCLUIR</span> <span>FECHAR</span>
            </div>
          </div>

          <div style={{ alignSelf: 'center', fontWeight: 'bold' }}>OU</div>

          <div style={{ ...cardStyle, width: '250px', opacity: 0.5 }}>
            <span style={{ fontWeight: 'bold', fontSize: '12px' }}>NOVO EVENTO</span>
            {/* ... Conteúdo similar ao anterior ... */}
          </div>
        </div>
      </div>
    </div>
  );
}
