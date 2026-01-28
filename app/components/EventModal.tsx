'use client';
import React, { useState, useEffect } from 'react';

type Profile = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Profile;
  tarefa?: {
    titulo: string;
    responsavel: Profile;
    data: string;
    status: string;
    linkDrive?: string;
    notificar?: string;
  } | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  event: AgendaEvent;
  onSave: (event: AgendaEvent, isEdit: boolean) => void;
  onDelete: (eventId: string) => void; // ⚡ Corrigido para build
};

export default function EventModal({ isOpen, onClose, event, onSave, onDelete }: Props) {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(event.conteudoPrincipal || '');
  const [profile, setProfile] = useState<Profile>(event.perfil || 'Confi');
  const [type, setType] = useState<'Interno' | 'Perfil'>(event.tipoEvento as any || 'Perfil');
  const [linkDrive, setLinkDrive] = useState(event.tarefa?.linkDrive || '');
  const [tarefaTitle, setTarefaTitle] = useState(event.tarefa?.titulo || '');
  const [start, setStart] = useState(event.start);
  const [end, setEnd] = useState(event.end);

  // Atualiza os estados se o evento mudar
  useEffect(() => {
    setTitle(event.conteudoPrincipal || '');
    setProfile(event.perfil || 'Confi');
    setType(event.tipoEvento as any || 'Perfil');
    setLinkDrive(event.tarefa?.linkDrive || '');
    setTarefaTitle(event.tarefa?.titulo || '');
    setStart(event.start);
    setEnd(event.end);
    setEditMode(false);
  }, [event]);

  if (!isOpen) return null;

  const handleSaveClick = () => {
    if (!title) return alert('Informe o título do evento');

    onSave({
      ...event,
      start,
      end,
      conteudoPrincipal: title,
      perfil: profile,
      tipoEvento: type,
      tarefa: tarefaTitle
        ? {
            ...event.tarefa,
            titulo: tarefaTitle,
            responsavel: profile,
            data: start,
            status: event.tarefa?.status || 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : null,
    }, editMode || !!event.id);
  };

  const handleDeleteClick = () => {
    if (confirm('Deseja realmente excluir este evento?')) {
      onDelete(event.id);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {!editMode ? (
          <>
            <h3>Evento</h3>
            <p><strong>Título:</strong> {title}</p>
            <p><strong>Perfil:</strong> {profile}</p>
            <p><strong>Tipo:</strong> {type}</p>
            <p><strong>Data/Hora:</strong> {start} → {end}</p>
            {tarefaTitle && <p><strong>Tarefa:</strong> {tarefaTitle} ({event.tarefa?.status})</p>}

            <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
              <button onClick={() => setEditMode(true)}>✏️ Editar</button>
              <button onClick={handleDeleteClick}>❌ Excluir</button>
              <button onClick={onClose}>Fechar</button>
            </div>
          </>
        ) : (
          <>
            <h3>Editar Evento</h3>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do evento" style={input} />
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
            <input value={start} onChange={e => setStart(e.target.value)} style={input} />
            <input value={end} onChange={e => setEnd(e.target.value)} style={input} />
            <input value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} placeholder="Título da tarefa" style={input} />
            <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)} placeholder="Link do Drive" style={input} />

            <div style={{ display: 'flex', gap: 5 }}>
              <button onClick={handleSaveClick} style={{ backgroundColor: '#1260c7', color: '#fff' }}>Salvar</button>
              <button onClick={() => setEditMode(false)}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 999
};
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 350, borderRadius: 8 };
const input: React.CSSProperties = { width: '100%', marginBottom: 10, padding: 8 };