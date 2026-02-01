'use client';

import React from 'react';
import { Perfil } from './types';

type SidebarEsquerdaProps = {
  filterProfile: Perfil;
  setFilterProfile: (p: Perfil) => void;
  profiles: Perfil[];
};

export default function SidebarEsquerda({
  filterProfile,
  setFilterProfile,
  profiles,
}: SidebarEsquerdaProps) {
  return (
    <aside style={{ width: 220, padding: 16, borderRight: '1px solid #eee' }}>
      <h3>Agenda</h3>

      <label style={{ display: 'block', marginBottom: 8 }}>
        Perfil ativo
      </label>

      <select
        value={filterProfile}
        onChange={e => setFilterProfile(e.target.value as Perfil)}
        style={{ width: '100%', padding: 8 }}
      >
        {profiles.map(p => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </aside>
  );
}