'use client';
import React, { useState } from 'react';

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');

  return (
    <div style={{
      height: 180,
      position: 'relative',
      backgroundColor: darkMode ? '#222' : '#ddd',
      backgroundImage: coverUrl ? `url(${coverUrl})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <button
        style={{ position: 'absolute', top: 16, right: 16 }}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      <input
        type="text"
        placeholder="URL da capa"
        value={coverUrl}
        onChange={e => setCoverUrl(e.target.value)}
        style={{ position: 'absolute', bottom: 16, left: 16, width: 200 }}
      />
    </div>
  );
}