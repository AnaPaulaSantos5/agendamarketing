'use client';
import React from 'react';
import { Perfil, ChecklistItem } from './types';

interface ProfileSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userPerfil: Perfil;
  checklist: ChecklistItem[];
  onToggleChecklistItem: (item: ChecklistItem) => void;
}

export default function ProfileSidebar({
  isOpen,
  onToggle,
  userPerfil,
  checklist,
  onToggleChecklistItem,
}: ProfileSidebarProps) {
  if (!isOpen) return (
    <div style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={onToggle}>
      <div style={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img src={`/profiles/${userPerfil}.png`} alt={userPerfil} style={{ width: 40, height: 40, borderRadius: '50%' }} />
      </div>
    </div>
  );

  return (
    <div style={{ width: 300, backgroundColor: '#f5f5f5', padding: 16 }}>
      <button onClick={onToggle}>Fechar</button>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src={`/profiles/${userPerfil}.png`} alt={userPerfil} style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#fff' }} />
        <h3>{userPerfil}</h3>
        <p>ResponsávelChatId: 55xxxxxxx</p>
        <p>Especificações:</p>
        <ul>
          <li>Produto A</li>
          <li>Produto B</li>
          <li>Conteúdo X</li>
        </ul>
      </div>

      <h4>Checklist do dia</h4>
      <ul>
        {checklist.map(item => (
          <li key={item.id}>
            {item.task} ({item.client}) <button onClick={() => onToggleChecklistItem(item)}>✅</button>
          </li>
        ))}
      </ul>
    </div>
  );
}