'use client';
import React, { useState, useEffect } from 'react';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type Tarefa = {
  titulo: string;
  responsavel: Perfil;
  data: string;
  status: string;
  linkDrive?: string;
  notificar?: string;
};

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal: string; // obrigatório
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  tarefa?: Tarefa | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  event: Partial<AgendaEvent>; // permite passar incompleto
};

export default function EventModal({ isOpen, onClose, onSave, event }: Props) {
  const [title, setTitle] = useState(event.conteudoPrincipal || '');
  const [profile, setProfile] = useState<Perfil>(event.perfil || 'Confi');
  const [type, setType] = useState<'Interno' | 'Perfil'>(event.tipo || 'Perfil');
  const [linkDrive, setLinkDrive] = useState(event.tarefa?.linkDrive || '');
  const [tarefaTitle, setTarefaTitle] = useState(event.tarefa?.titulo || '');
  const [start, setStart] = useState(event.start || '');
  const [end, setEnd] = useState(event.end || '');

  useEffect(() => {
    // atualizar estado quando abrir modal para edição
    setTitle(event.conteudoPrincipal || '');
    setProfile(event.perfil || 'Confi');
    setType(event.tipo || 'Perfil');
    setLinkDrive(event.tarefa?.linkDrive || '');
    setTarefaTitle(event.tarefa?.titulo || '');
    setStart(event.start || '');
    setEnd(event.end || '');
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title) return alert('Informe o título do evento');

    const eventData: AgendaEvent = {
      id: event.id || '', // vazio se for novo
      start,
      end,
      tipoEvento: type,
      tipo: type,
      conteudoPrincipal: title,
      conteudoSecundario: event.conteudoSecundario || '',
      cta: event.cta || '',
      statusPostagem: event.statusPostagem || '',
      perfil: profile,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: profile,
            data: start,
            status: event.tarefa?.status || 'Pendente',
            linkDrive,
            notificar: event.tarefa?.notificar || 'Sim',
          }
        : null,
    };

    onSave(eventData);
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{event.id ? 'Editar Evento/Tarefa' : 'Novo Evento/Tarefa'}</h3>

        <input
          placeholder="Título do evento"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={input}
        />

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

        <input
          placeholder="Título da tarefa (opcional)"
          value={tarefaTitle}
          onChange={e => setTarefaTitle(e.target.value)}
          style={input}
        />
        <input
          placeholder="Link do Drive (opcional)"
          value={linkDrive}
          onChange={e => setLinkDrive(e.target.value)}
          style={input}
        />

        <input
          type="datetime-local"
          value={start}
          onChange={e => setStart(e.target.value)}
          style={input}
        />
        <input
          type="datetime-local"
          value={end}
          onChange={e => setEnd(e.target.value)}
          style={input}
        />

        <button onClick={handleSave} style={{ ...input, backgroundColor: '#1260c7', color: '#fff' }}>
          Salvar
        </button>
        <button onClick={onClose} style={{ ...input, marginTop: '0.5rem' }}>
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
  zIndex: 999,
};
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 350, borderRadius: 8 };
const input: React.CSSProperties = { width: '100%', marginBottom: 10, padding: 8 };