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
  const [tarefaTitle, setTarefaTitle] = useState('');

  if (!isOpen) return null;

  function handleSave() {
    if (!title) return alert('Informe o título do evento');

    const eventData = {
      start,
      end,
      tipoEvento: type,
      conteudoPrincipal: title,
      perfil: profile,
      tarefa: tarefaTitle ? {
        titulo: tarefaTitle,
        responsavel: profile,
        data: start,
        status: 'Pendente',
        linkDrive,
        notificar: 'Sim',
      } : undefined,
    };

    onSave(eventData);
    onClose();
    setTitle('');
    setTarefaTitle('');
    setLinkDrive('');
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Novo Evento/Tarefa</h3>
        <input placeholder="Título do evento" value={title} onChange={e => setTitle(e.target.value)} style={input} />

        <select value={profile} onChange={e => setProfile(e.target.value as Profile)} style={input}>
          <option>Confi</option>
          <option>Cecília</option>
          <option>Luiza</option>
          <option>Júlio</option>
        </select>

        <select value={type} onChange={e => setType(e.target.value as any)} style={input}>
          <option value="Perfil">Perfil</option>
          <option value="Interno">Interno</option>
        </select>

        <input placeholder="Título da tarefa (opcional)" value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} style={input} />
        <input placeholder="Link do Drive (opcional)" value={linkDrive} onChange={e => setLinkDrive(e.target.value)} style={input} />

        <button onClick={handleSave} style={{ ...input, backgroundColor: '#1260c7', color: '#fff' }}>Salvar</button>
        <button onClick={onClose} style={{ ...input, marginTop: '0.5rem' }}>Cancelar</button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 350, borderRadius: 8 };
const input: React.CSSProperties = { width: '100%', marginBottom: 10, padding: 8 };
