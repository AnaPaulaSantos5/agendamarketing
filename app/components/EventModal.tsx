'use client';
import React, { useState, useEffect } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  event: AgendaEvent;
  onSave: (event: AgendaEvent, isEdit: boolean) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
};

export default function EventModal({ isOpen, onClose, event, onSave, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event.conteudoPrincipal);
  const [start, setStart] = useState(event.start);
  const [end, setEnd] = useState(event.end);
  const [profile, setProfile] = useState<Perfil>(event.perfil || 'Confi');
  const [tarefaTitle, setTarefaTitle] = useState(event.tarefa?.titulo || '');
  const [linkDrive, setLinkDrive] = useState(event.tarefa?.linkDrive || '');

  useEffect(() => {
    setTitle(event.conteudoPrincipal);
    setStart(event.start);
    setEnd(event.end);
    setProfile(event.perfil || 'Confi');
    setTarefaTitle(event.tarefa?.titulo || '');
    setLinkDrive(event.tarefa?.linkDrive || '');
    setIsEditing(false);
  }, [event]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title) return alert('Informe o título do evento');

    const newEvent: AgendaEvent = {
      ...event,
      conteudoPrincipal: title,
      start,
      end,
      perfil: profile,
      tarefa: tarefaTitle ? { titulo: tarefaTitle, responsavel: profile, data: start, status: event.tarefa?.status || 'Pendente', linkDrive, notificar: 'Sim' } : null,
    };

    onSave(newEvent, Boolean(event.id));
    onClose();
  };

  const handleDelete = () => {
    if (!event.id) return;
    onDelete(event.id);
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Evento</h3>

        {!isEditing ? (
          <>
            <div><strong>Título:</strong> {title}</div>
            <div><strong>Data/Hora:</strong> {start} - {end}</div>
            <div><strong>Perfil:</strong> {profile}</div>
            {tarefaTitle && <div><strong>Tarefa:</strong> {tarefaTitle}</div>}
            <button onClick={() => setIsEditing(true)}>Editar</button>
            <button onClick={handleDelete} style={{ marginLeft: 5, backgroundColor: 'red', color: '#fff' }}>Excluir</button>
          </>
        ) : (
          <>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do evento" style={input} />
            <input value={start} onChange={e => setStart(e.target.value)} placeholder="Data/Hora início" style={input} />
            <input value={end} onChange={e => setEnd(e.target.value)} placeholder="Data/Hora fim" style={input} />
            <select value={profile} onChange={e => setProfile(e.target.value as Perfil)} style={input}>
              {['Confi', 'Cecília', 'Luiza', 'Júlio'].map(p => <option key={p}>{p}</option>)}
            </select>
            <input value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} placeholder="Título da tarefa (opcional)" style={input} />
            <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)} placeholder="Link do Drive (opcional)" style={input} />
            <button onClick={handleSave} style={{ ...input, backgroundColor: '#1260c7', color: '#fff' }}>Salvar</button>
            <button onClick={() => setIsEditing(false)} style={{ ...input, marginTop: 5 }}>Cancelar</button>
          </>
        )}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 350, borderRadius: 8 };
const input: React.CSSProperties = { width: '100%', marginBottom: 10, padding: 8 };