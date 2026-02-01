'use client';

import React, { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';
import { useSession } from 'next-auth/react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
  onDelete: (id: string) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
  isAdmin: boolean;
};

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  start,
  end,
  event,
  isAdmin,
}: Props) {
  const { data: session } = useSession();

  const [editing, setEditing] = useState(!event);

  const [title, setTitle] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('Confi');
  const [tipo, setTipo] = useState<'Interno' | 'Perfil'>('Perfil');

  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [cta, setCta] = useState('');
  const [statusPostagem, setStatusPostagem] = useState('');

  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState(session?.user?.responsavelChatId || '');

  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || 'Confi');
      setTipo(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setConteudoSecundario(event.conteudoSecundario || '');
      setCta(event.cta || '');
      setStatusPostagem(event.statusPostagem || '');
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setResponsavelChatId(event.tarefa?.responsavelChatId || session?.user?.responsavelChatId || '');
      setStartDate(event.start);
      setEndDate(event.end);
      setEditing(false);
    } else {
      setEditing(true);
      setStartDate(start);
      setEndDate(end);
      setResponsavelChatId(session?.user?.responsavelChatId || '');
    }
  }, [event, start, end, session?.user?.responsavelChatId]);

  if (!isOpen) return null;

  const handleSave = () => {
    const ev: AgendaEvent = {
      id: event?.id || String(Date.now()),
      start: startDate,
      end: endDate,
      conteudoPrincipal: title,
      conteudoSecundario,
      cta,
      statusPostagem,
      perfil,
      tipoEvento: tipo,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: perfil,
            responsavelChatId: responsavelChatId || session?.user?.responsavelChatId || '',
            data: startDate,
            status: 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : null,
    };

    onSave(ev, !!event);
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{event ? 'Editar Evento' : 'Novo Evento'}</h3>

        {/* Avatar e dados do usuário */}
        {session?.user && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
            <img
              src={session.user.image || '/default-avatar.png'}
              alt={session.user.name || 'Usuário'}
              style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }}
            />
            <div>
              <p style={{ margin: 0 }}>{session.user.name}</p>
              <small>{session.user.email}</small>
            </div>
          </div>
        )}

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título"
        />
        <textarea
          value={conteudoSecundario}
          onChange={e => setConteudoSecundario(e.target.value)}
          placeholder="Conteúdo secundário"
        />
        <input value={cta} onChange={e => setCta(e.target.value)} placeholder="CTA" />
        <input
          value={statusPostagem}
          onChange={e => setStatusPostagem(e.target.value)}
          placeholder="Status postagem"
        />
        <input
          value={tarefaTitle}
          onChange={e => setTarefaTitle(e.target.value)}
          placeholder="Tarefa"
        />
        <input
          value={responsavelChatId || session?.user?.responsavelChatId || ''}
          onChange={e => isAdmin && setResponsavelChatId(e.target.value)}
          placeholder="Responsável Chat ID"
          readOnly={!isAdmin}
        />
        <input
          value={linkDrive}
          onChange={e => setLinkDrive(e.target.value)}
          placeholder="Link do Drive"
        />
        <input
          type="datetime-local"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
        />
        <input
          type="datetime-local"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
        />

        <button onClick={handleSave} style={btnStyle}>
          Salvar
        </button>
        <button onClick={onClose} style={{ ...btnStyle, background: '#ccc', marginLeft: 6 }}>
          Fechar
        </button>
        {event && isAdmin && (
          <button onClick={() => onDelete(event.id)} style={{ ...btnStyle, background: '#f44336', marginLeft: 6 }}>
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 360,
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const btnStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  background: '#1260c7',
  color: '#fff',
};