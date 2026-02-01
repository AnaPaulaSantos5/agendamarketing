'use client';

import React, { useState } from 'react';

export default function SidebarDireita() {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div style={{ width: 250, padding: 16, borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Ícone estrela */}
      <button onClick={() => setShowPanel(!showPanel)} style={{ cursor: 'pointer', fontSize: 24 }}>
        ⭐
      </button>

      {/* Painel WhatsApp + Spotify */}
      {showPanel && (
        <div style={{ backgroundColor: '#f5f5f5', padding: 8, borderRadius: 8 }}>
          <p><strong>WhatsApp:</strong> <a href="https://wa.me/55999999999" target="_blank">Abrir</a></p>
          <p><strong>Spotify:</strong> <a href="https://open.spotify.com" target="_blank">Abrir</a></p>
        </div>
      )}
    </div>
  );
}