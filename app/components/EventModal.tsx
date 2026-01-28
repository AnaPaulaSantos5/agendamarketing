'use client';
import React, { useState } from 'react';

type Profile = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: any) => void;
  start: string;
  end: string;
};

export default function EventModal({ isOpen, onClose, onSave, start, end }: Props) {
  const [title, setTitle] = useState('');
  const [profile, setProfile] = useState<Profile>('Confi');
  const [type, setType] = useState<'Interno' | 'Perfil'>('Perfil');
  const [linkDrive, setLinkDrive] = useState('');

  if (!isOpen) return null;

  function handleSave() {
    if (!title) return alert('Informe o título');
    onSave({
      id: String(Date.now()),
      title,
      start,
      end,
      tipoEvento: type,
      perfil: profile,
      linkDrive,
    });
    onClose();
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Novo Evento</h3>
        <input
          placeholder="Título da tarefa"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={input}
        />
        <select value={profile} onChange={e => setProfile(e.target.value as Profile)} style={input}>
          <option>Confi</option>
          <option>Cecília</option>
          <option>Luiza</option>
          <option>Júlio</option>
        </select>
        <select value={type} onChange={e => setType(e.target.value as any)} style={input}>
          <option value="Perfil">Perfil (envia mensagem)</option>
          <option value="Interno">Interno (não envia)</option>
        </select>
        <input
          placeholder="Link do Drive (opcional)"
          value={linkDrive}
          onChange={e => setLinkDrive(e.target.value)}
          style={input}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleSave}>Salvar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 350,
  borderRadius: 8,
  maxHeight: '90vh',
  overflowY: 'auto',
};

const input: React.CSSProperties = {
  width: '100%',
  marginBottom: 10,
  padding: 8,
};
