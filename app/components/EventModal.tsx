'use client';
import React, { useState, useEffect } from 'react';

export type Profile = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Profile;
  tarefa?: {
    titulo?: string;
    responsavel?: Profile;
    data?: string;
    status?: string;
    linkDrive?: string;
    notificar?: string;
  } | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent, isEdit: boolean) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
  event: AgendaEvent | null;
};

export default function EventModal({ isOpen, onClose, onSave, onDelete, event }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [profile, setProfile] = useState<Profile>('Confi');
  const [type, setType] = useState<'Interno' | 'Perfil'>('Perfil');
  const [linkDrive, setLinkDrive] = useState('');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal);
      setProfile(event.perfil || 'Confi');
      setType(event.tipo as 'Interno' | 'Perfil' || 'Perfil');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setTarefaTitle(event.tarefa?.titulo || '');
      setStart(event.start);
      setEnd(event.end);
      setIsEditing(false);
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSave = () => {
    if (!title) return alert('Informe o título do evento');

    onSave(
      {
        id: event.id,
        start,
        end,
        tipoEvento: type,
        conteudoPrincipal: title,
        perfil: profile,
        conteudoSecundario: event.conteudoSecundario,
        cta: event.cta,
        statusPostagem: event.statusPostagem,
        tarefa: tarefaTitle
          ? {
              titulo: tarefaTitle,
              responsavel: profile,
              data: start,
              status: event.tarefa?.status || 'Pendente',
              linkDrive,
              notificar: 'Sim',
            }
          : null,
      },
      true
    );
    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    if (!confirm('Deseja realmente excluir este evento?')) return;
    onDelete(event.id);
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {!isEditing ? (
          <>
            <h3>{event.conteudoPrincipal}</h3>
            <p><b>Perfil:</b> {event.perfil}</p>
            <p><b>Tipo:</b> {event.tipo}</p>
            <p><b>Data/Hora:</b> {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}</p>
            {event.conteudoSecundario && <p><b>Info:</b> {event.conteudoSecundario}</p>}
            {event.cta && <p><b>CTA:</b> {event.cta}</p>}
            {event.tarefa && (
              <p>
                <b>Tarefa:</b> {event.tarefa.titulo} ({event.tarefa.status})
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button style={buttonBlue} onClick={() => setIsEditing(true)}>Editar</button>
              <button style={buttonRed} onClick={handleDelete}>Excluir</button>
              <button style={buttonGrey} onClick={onClose}>Fechar</button>
            </div>
          </>
        ) : (
          <>
            <h3>Editar Evento/Tarefa</h3>
            <input style={input} placeholder="Título do evento" value={title} onChange={e => setTitle(e.target.value)} />
            <select style={input} value={profile} onChange={e => setProfile(e.target.value as Profile)}>
              <option>Confi</option>
              <option>Cecília</option>
              <option>Luiza</option>
              <option>Júlio</option>
            </select>
            <select style={input} value={type} onChange={e => setType(e.target.value as 'Interno' | 'Perfil')}>
              <option value="Perfil">Perfil</option>
              <option value="Interno">Interno</option>
            </select>
            <input style={input} type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
            <input style={input} type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
            <input style={input} placeholder="Título da tarefa (opcional)" value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} />
            <input style={input} placeholder="Link do Drive (opcional)" value={linkDrive} onChange={e => setLinkDrive(e.target.value)} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={buttonBlue} onClick={handleSave}>Salvar</button>
              <button style={buttonGrey} onClick={() => setIsEditing(false)}>Cancelar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 };
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 380, borderRadius: 8 };
const input: React.CSSProperties = { width: '100%', marginBottom: 10, padding: 8 };
const buttonBlue: React.CSSProperties = { padding: '8px 12px', backgroundColor: '#1260c7', color: '#fff', border: 'none', cursor: 'pointer' };
const buttonRed: React.CSSProperties = { padding: '8px 12px', backgroundColor: '#f44336', color: '#fff', border: 'none', cursor: 'pointer' };
const buttonGrey: React.CSSProperties = { padding: '8px 12px', backgroundColor: '#ccc', color: '#000', border: 'none', cursor: 'pointer' };