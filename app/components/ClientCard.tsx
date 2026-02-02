'use client';
import React from 'react';

export default function ClientCard() {
  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ccc' }} />
        <div>
          <div style={{ fontWeight: 'bold' }}>Nome Cliente</div>
          <div style={{ fontSize: 12 }}>cliente@email.com</div>
          <div style={{ fontSize: 12 }}>12345</div>
        </div>
      </div>
    </div>
  );
}