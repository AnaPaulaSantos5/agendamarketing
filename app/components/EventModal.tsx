'use client';
import React, { useState } from 'react';
import { AgendaEvent, Perfil } from '@/lib/types';
import { v4 as uuid } from 'uuid';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  start: string;
  end: string;
};

export default function EventModal({ isOpen, onClose, onSave, start, end }: Props) {
  const [title, setTitle] = useState('');
  const [profile, setProfile] = useState<Perfil>('Confi');
  const [type, setType] = useState<'Interno' | 'Perfil'>('Perfil');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  if (!isOpen) return null;

  function handleSave() {
    if (!title) return alert('Informe o título do evento');

    const newEvent: AgendaEvent = {
      id: uuid(),
      start: `${start}T${startTime}`,
      end: `${end}T${endTime}`,
      tipoEvento: type,
      conteudoPrincipal: title,
      perfil: profile,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: profile,
            data: `${start}T${startTime}`,
            status: 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : undefined,
    };

    onSave(newEvent);
    onClose();

    // Reset inputs
    setTitle('');
    setTarefaTitle('');
    setLinkDrive('');
    setStartTime('09:00');
    setEndTime('10:00');
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Novo Evento/Tarefa</h3>
        <input placeholder="Título do evento" value={title} onChange={e => setTitle(e.target.value)} style={input} />

        <select value={profile} onChange={e => setProfile(e.target.value as Perfil)} style={input}>
          <option>Confi</option>
          <option>Cecília</option>
          <option>Luiza</option>
          <option>Júlio</option>
        </select>

        <select value={type} onChange={e => setType(e.target.value as any)} style={input}>
          <option value="Perfil">Perfil</option>
          <option value="Interno">Interno</option>
        </select>

        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={input} />
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} style={input} />

        <input placeholder="Título da tarefa (opcional)" value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} style={input} />
        <input placeholder="Link do Drive (opcional)" value={linkDrive} onChange={e => setLinkDrive(e.target.value)} style={input} />

        <button onClick={handleSave} style={{ ...input, backgroundColor: '#1260c7', color: '#fff' }}>Salvar</button>
        <button onClick={onClose} style={{ ...input, marginTop: 8 }}>Cancelar</button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999,
};

const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 350, borderRadius: 8 };
const input: React.CSSProperties = { width: '100%', padding: 8, marginBottom: 10 };