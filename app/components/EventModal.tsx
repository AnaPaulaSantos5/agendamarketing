'use client';
import React, { useState, useEffect } from 'react';

export type Tarefa = {
  titulo: string;
  responsavel: string;
  data: string;
  status: 'Pendente' | 'Concluída';
  linkDrive?: string;
  notificar?: string;
};

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  conteudoPrincipal: string;
  perfil?: string;
  tipo?: 'Interno' | 'Perfil';
  tarefa?: Tarefa | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  event: AgendaEvent;
  onSave: (event: AgendaEvent, isEdit: boolean) => void;
  onDelete: (eventId: string) => void;
};

export default function EventModal({ isOpen, onClose, event, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(event.conteudoPrincipal || '');
  const [profile, setProfile] = useState(event.perfil || 'Confi');
  const [type, setType] = useState<'Interno' | 'Perfil'>(event.tipo || 'Perfil');
  const [linkDrive, setLinkDrive] = useState(event.tarefa?.linkDrive || '');
  const [tarefaTitle, setTarefaTitle] = useState(event.tarefa?.titulo || '');
  const [tarefaStatus, setTarefaStatus] = useState(event.tarefa?.status || 'Pendente');

  useEffect(() => {
    setTitle(event.conteudoPrincipal || '');
    setProfile(event.perfil || 'Confi');
    setType(event.tipo || 'Perfil');
    setLinkDrive(event.tarefa?.linkDrive || '');
    setTarefaTitle(event.tarefa?.titulo || '');
    setTarefaStatus(event.tarefa?.status || 'Pendente');
  }, [event]);

  if (!isOpen) return null;

  const handleSaveClick = () => {
    if (!title) return alert('Informe o título do evento');
    const updatedEvent: AgendaEvent = {
      ...event,
      conteudoPrincipal: title,
      perfil: profile,
      tipo: type,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: profile,
            data: event.start,
            status: tarefaStatus as 'Pendente' | 'Concluída',
            linkDrive,
            notificar: 'Sim',
          }
        : null,
    };
    onSave(updatedEvent, !!event.id);
  };

  const handleDeleteClick = () => {
    if (confirm('Deseja realmente excluir este evento?')) {
      onDelete(event.id);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Evento: {event.conteudoPrincipal}</h3>
        <input placeholder="Título do evento" value={title} onChange={e => setTitle(e.target.value)} style={input} />
        <select value={profile} onChange={e => setProfile(e.target.value)} style={input}>
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
        <select value={tarefaStatus} onChange={e => setTarefaStatus(e.target.value as any)} style={input}>
          <option value="Pendente">Pendente</option>
          <option value="Concluída">Concluída</option>
        </select>

        <button onClick={handleSaveClick} style={{ ...input, backgroundColor: '#1260c7', color: '#fff' }}>Salvar</button>
        <button onClick={handleDeleteClick} style={{ ...input, marginTop: 5, backgroundColor: '#c71212', color: '#fff' }}>Excluir</button>
        <button onClick={onClose} style={{ ...input, marginTop: 5 }}>Cancelar</button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 350, borderRadius: 8 };
const input: React.CSSProperties = { width: '100%', marginBottom: 10, padding: 8 };