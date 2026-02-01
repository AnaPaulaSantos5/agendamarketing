'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Perfil, ChecklistItem } from './types';

type SidebarEsquerdaProps = {
  checklist: ChecklistItem[];
  filterProfile: Perfil;
  setFilterProfile: (p: Perfil) => void;
  profiles: Perfil[];
};

export default function SidebarEsquerda({
  checklist,
  filterProfile,
  setFilterProfile,
  profiles,
}: SidebarEsquerdaProps) {
  const { data: session } = useSession();
  const [showProfile, setShowProfile] = useState(false);

  if (!session) return null;

  const user = session.user;

  return (
    <div style={{ width: 250, padding: 16, borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Foto do usuário */}
      <div
        style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#fff', overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => setShowProfile(!showProfile)}
      >
        <img src={user.image || '/default-avatar.png'} alt={user.name || 'Usuário'} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Filtro (admin) */}
      {user.role === 'admin' && (
        <select value={filterProfile} onChange={(e) => setFilterProfile(e.target.value as Perfil)}>
          {profiles.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      )}

      {/* Painel de perfil */}
      {showProfile && (
        <div style={{ backgroundColor: '#f5f5f5', padding: 8, borderRadius: 8 }}>
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>ResponsavelChatId:</strong> {user.responsavelChatId}</p>
          <p><strong>Especificações:</strong></p>
          <ul>
            <li>Produto A</li>
            <li>Produto B</li>
            <li>Conteúdo exemplo</li>
          </ul>
        </div>
      )}

      {/* Checklist do dia */}
      <div>
        <h4>Checklist do dia</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {checklist.map((item) => (
            <li key={item.id}>
              {item.task} ({item.client}) {item.done ? '✅' : '❌'}
            </li>
          ))}
          {checklist.length === 0 && <li>Sem tarefas hoje ✅</li>}
        </ul>
      </div>
    </div>
  );
}