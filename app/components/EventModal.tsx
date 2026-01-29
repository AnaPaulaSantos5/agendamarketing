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
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');

  if (!isOpen) return null;

  function handleSave() {
    if (!title) {
      alert('Informe o título');
      return;
    }

    onSave({
      start,
      end,
      tipoEvento: type,
      tipo: tarefaTitle ? 'Tarefa' : 'Evento',
      conteudoPrincipal: title,
      perfil: profile,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: profile,
            data: start,
            status: 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : undefined,
    });

    setTitle('');
    setTarefaTitle('');
    setLinkDrive('');
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Novo Evento / Tarefa</h3>

        <input style={input} placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />

        <select style={input} value={profile} onChange={e => setProfile(e.target.value as Profile)}>
          <option>Confi</option>
          <option>Cecília</option>
          <option>Luiza</option>
          <option>Júlio</option>
        </select>

        <select style={input} value={type} onChange={e => setType(e.target.value as any)}>
          <option value="Perfil">Perfil</option>
          <option value="Interno">Interno</option>
        </select>

        <input
          style={input}
          placeholder="Título da tarefa (opcional)"
          value={tarefaTitle}
          onChange={e => setTarefaTitle(e.target.value)}
        />

        <input
          style={input}
          placeholder="Link do Drive (opcional)"
          value={linkDrive}
          onChange={e => setLinkDrive(e.target.value)}
        />

        <button style={saveBtn} onClick={handleSave}>
          Salvar
        </button>
        <button style={input} onClick={onClose}>
          Cancelar
        </button>
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
  width: 360,
  borderRadius: 8,
};

const input: React.CSSProperties = {
  width: '100%',
  marginBottom: 10,
  padding: 8,
};

const saveBtn: React.CSSProperties = {
  ...input,
  background: '#1260c7',
  color: '#fff',
};