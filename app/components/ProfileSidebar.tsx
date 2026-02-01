'use client';

import React from 'react';
import { Perfil } from './types';

interface ProfileSidebarProps {
  userName: string;
  userPerfil: Perfil;
  responsavelChatId: string;
  profiles: Perfil[];
  onProfileChange: (perfil: Perfil) => void;
  onToggleProfilePanel: () => void;
}

export default function ProfileSidebar({
  userName,
  userPerfil,
  responsavelChatId,
  profiles,
  onProfileChange,
  onToggleProfilePanel,
}: ProfileSidebarProps) {
  return (
    <aside style={{ width: 250, padding: 16, borderRight: '1px solid #ccc' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={onToggleProfilePanel}
        >
          <img
            src="/default-profile.png"
            alt="Usuário"
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
        </div>
        <select
          value={userPerfil}
          onChange={e => onProfileChange(e.target.value as Perfil)}
          style={{ marginLeft: 8 }}
        >
          {profiles.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p><strong>Nome:</strong> {userName}</p>
        <p><strong>Responsável ChatId:</strong> {responsavelChatId}</p>
        <p><strong>Especificações:</strong></p>
        <ul>
          <li>Produto A</li>
          <li>Produto B</li>
        </ul>
      </div>
    </aside>
  );
}