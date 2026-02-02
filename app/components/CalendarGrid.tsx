'use client';
import React from 'react';

export default function CalendarGrid({ onEventClick }: { onEventClick: () => void }) {
  return (
    <div style={{ height: '100%', background: '#fff', borderRadius: 8, padding: 16 }}>
      <h3>Calendário (template visual)</h3>
      <div
        style={{
          marginTop: 16,
          height: 'calc(100% - 32px)',
          border: '1px dashed #ccc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={onEventClick}
      >
        Clique para abrir modal de evento
      </div>
    </div>
  );
}