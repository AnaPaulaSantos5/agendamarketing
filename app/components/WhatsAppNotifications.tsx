'use client';
import React from 'react';

export default function WhatsAppNotifications() {
  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        <div style={{ background: '#25D366', color: '#fff', padding: 8, borderRadius: 4, marginBottom: 4 }}>
          Mensagem recebida
        </div>
        <div style={{ background: '#34B7F1', color: '#fff', padding: 8, borderRadius: 4 }}>
          Mensagem enviada
        </div>
      </div>
    </div>
  );
}