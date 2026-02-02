'use client';
import React from 'react';

export default function EventModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, width: 400 }}>
        <h3>Título do Evento</h3>
        <p>Conteúdo secundário</p>
        <input placeholder="Link Drive" style={{ width: '100%', marginBottom: 8 }} />
        <input type="datetime-local" style={{ width: '100%', marginBottom: 8 }} />
        <input type="datetime-local" style={{ width: '100%', marginBottom: 8 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose}>Fechar</button>
          <button>Salvar</button>
        </div>
      </div>
    </div>
  );
}