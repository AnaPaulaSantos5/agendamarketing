'use client';

import React from 'react';

export default function RightSidebar() {
  return (
    <aside style={{ width: 200, padding: 16, borderLeft: '1px solid #ccc' }}>
      <h3>Integrações</h3>
      <ul>
        <li>
          <a href="https://web.whatsapp.com" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </li>
        <li>
          <a href="https://open.spotify.com" target="_blank" rel="noreferrer">
            Spotify
          </a>
        </li>
      </ul>
    </aside>
  );
}