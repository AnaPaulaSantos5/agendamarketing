'use client';
import React from 'react';

export default function RightSidebar() {
  return (
    <div style={{ width: 80, backgroundColor: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 8 }}>
      <a href="https://web.whatsapp.com/" target="_blank" rel="noopener noreferrer">
        <img src="/icons/whatsapp.png" alt="WhatsApp" style={{ width: 40, height: 40, marginBottom: 16 }} />
      </a>
      <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">
        <img src="/icons/spotify.png" alt="Spotify" style={{ width: 40, height: 40 }} />
      </a>
    </div>
  );
}