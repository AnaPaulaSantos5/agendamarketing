'use client';
import React, { useState, useEffect } from 'react';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id?: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: 'Interno' | 'Perfil';
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    data: string;
    status: 'Pendente' | 'Concluída';
    linkDrive?: string;
    notificar?: string;
  } | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  event: Partial<AgendaEvent>;
  onSave: (event: AgendaEvent) => void;
  onDelete?: (id: string) => void;
};

export default function EventModal({ isOpen, onClose, event, onSave, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [profile, setProfile] = useState<Perfil>('Confi');
  const [type, setType] = useState<'Interno' | 'Perfil'>('Perfil');
  const [linkDrive, setLinkDrive] = useState('');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [tarefaStatus, setTarefaStatus] = useState<'Pendente' | 'Concluída'>('Pendente');

  useEffect(() => {
    setTitle(event.conteudoPrincipal || '');
    setProfile(event.perfil || 'Confi');
    setType(event.tipo || 'Perfil');
    setLinkDrive(event.tarefa?.linkDrive || '');
    setTarefaTitle(event.tarefa?.titulo || '');
    setTarefaStatus(event.tarefa?.status || 'Pendente');
  }, [event]);

  if (!isOpen) return null;

  function handleSave() {
    if (!title) return alert('Informe o título do evento');

    const newEvent: AgendaEvent = {
      id: event.id,
      start: event.start || new Date().toISOString(),
      end: event.end || new Date().toISOString(),
      conteudoPrincipal: title,
      tipo: type,
      perfil: profile,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: profile,
            data: event.start || new Date().toISOString(),
            status: tarefaStatus,
            linkDrive,
            notificar: 'Sim',
          }
        : null,
    };

    onSave(newEvent);
    onClose();
  }

  function handleDelete() {
    if (!event.id) return;
    if (confirm('Deseja realmente excluir este evento?')) {
      onDelete && onDelete(event.id);
      onClose();
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Evento/Tarefa</h3>
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

        <input placeholder="Título da tarefa (opcional)" value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} style={input} />
        <select value={tarefaStatus} onChange={e => setTarefaStatus(e.target.value as any)} style={input}>
          <option value="Pendente">Pendente</option>
          <option value="Concluída">Concluída</option>
        </select>

        <input placeholder="Link do Drive (opcional)" value={linkDrive} onChange={e => setLinkDrive(e.target.value)} style={input} />

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSave} style={{ ...input, backgroundColor: '#1260c7', color: '#fff' }}>Salvar</button>
          {event.id && (
            <button onClick={handleDelete} style={{ ...input, backgroundColor: '#ff4d4f', color: '#fff' }}>Excluir</button>
          )}
        </div>

        <button onClick={onClose} style={{ ...input, marginTop: '0.5rem' }}>Cancelar</button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 350, borderRadius: 8 };
const input: React.CSSProperties = { width: '100%', marginBottom: 10, padding: 8 };