'use client';

import React from 'react';
import AgendaCalendar from './AgendaCalendar';
import { Perfil } from './types';

interface AgendaLayoutProps {
  userPerfil: Perfil;
  onPerfilChange?: (p: Perfil) => void;
  userName?: string;
}

export default function AgendaLayout({
  userPerfil,
  onPerfilChange,
  userName,
}: AgendaLayoutProps) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, padding: 16, borderRight: '1px solid #eee' }}>
        <h3>{userName || 'Agenda'}</h3>

        <label>Perfil ativo:</label>
        <select
          value={userPerfil}
          onChange={e => onPerfilChange?.(e.target.value as Perfil)}
          style={{ width: '100%', marginTop: 8 }}
        >
          <option>Confi</option>
          <option>Cecília</option>
          <option>Luiza</option>
          <option>Júlio</option>
        </select>
      </aside>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: 16 }}>
        <AgendaCalendar />
      </main>
    </div>
  );
}