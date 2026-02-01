'use client';

import React, { useState } from 'react';

export default function HeaderPersonalizacao() {
  const [darkMode, setDarkMode] = useState(false);
  const [cover, setCover] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', padding: 16, display: 'flex', gap: 16, alignItems: 'center', backgroundColor: darkMode ? '#333' : '#eee' }}>
      <input type="file" accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) setCover(URL.createObjectURL(file));
      }} />
      <button onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? 'Modo Claro' : 'Modo Escuro'}
      </button>
      {cover && <img src={cover} alt="Capa" style={{ height: 50, objectFit: 'cover' }} />}
    </div>
  );
}