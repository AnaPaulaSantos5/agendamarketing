'use client';

import React, { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
  onDelete: (id: string) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
  isAdmin: boolean;
  userPerfil: Perfil;
  userChatId: string;
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
  userPerfil,
  userChatId,
}: Props) {
  const [editing, setEditing] = useState(!event);

  const [title, setTitle] = useState('');
  const [perfil, setPerfil] = useState<Perfil>(userPerfil);
  const [tipo, setTipo] = useState<'Interno' | 'Perfil'>('Perfil');

  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [cta, setCta] = useState('');
  const [statusPostagem, setStatusPostagem] = useState('');

  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState(userChatId);

  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || userPerfil);
      setTipo(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setConteudoSecundario(event.conteudoSecundario || '');
      setCta(event.cta || '');
      setStatusPostagem(event.statusPostagem || '');
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setResponsavelChatId(event.tarefa?.responsavelChatId || userChatId);
      setStartDate(event.start);
      setEndDate(event.end);
      setEditing(false);
    } else {
      setEditing(true);
      setStartDate(start);
      setEndDate(end);
    }
  }, [event, start, end, userPerfil, userChatId]);

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
            responsavelChatId,
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
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <img
            src={`https://ui-avatars.com/api/?name=${userPerfil}&background=1260c7&color=fff&rounded=true`}
            alt={userPerfil}
            style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 12, cursor: 'pointer' }}
            title={`Perfil: ${userPerfil}`}
          />
          <h3 style={{ margin: 0 }}>{event ? 'Editar Evento' : 'Novo Evento'}</h3>
        </div>

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

        <input
          value={cta}
          onChange={e => setCta(e.target.value)}
          placeholder="CTA"
          disabled={!isAdmin} // só admin altera
        />

        <input
          value={statusPostagem}
          onChange={e => setStatusPostagem(e.target.value)}
          placeholder="Status postagem"
          disabled={!isAdmin} // só admin altera
        />

        <input
          value={tarefaTitle}
          onChange={e => setTarefaTitle(e.target.value)}
          placeholder="Tarefa"
        />

        <input
          value={responsavelChatId}
          onChange={e => setResponsavelChatId(e.target.value)}
          placeholder="Responsável Chat ID"
          disabled // sempre bloqueado para o usuário
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

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={handleSave}>Salvar</button>
          <button onClick={onClose}>Fechar</button>
          {event && isAdmin && <button onClick={() => onDelete(event.id)}>Excluir</button>}
        </div>
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
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 380,
  maxHeight: '90vh',
  overflowY: 'auto',
};