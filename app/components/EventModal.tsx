'use client';
import React, { useState, useEffect } from 'react';
import { AgendaEvent } from '../lib/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
  onDelete: (id: string) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
};

export default function EventModal({ isOpen, onClose, onSave, onDelete, start, end, event }: Props) {
  const [editing, setEditing] = useState(!event);
  const [title, setTitle] = useState('');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [perfil, setPerfil] = useState('Confi');
  const [tipo, setTipo] = useState<'Evento' | 'Tarefa'>('Tarefa');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setConteudoSecundario(event.conteudoSecundario || '');
      setPerfil(event.perfil || 'Confi');
      setTipo(event.tipoEvento === 'Evento' ? 'Evento' : 'Tarefa');
      setTarefaTitle(event.tarefa?.titulo || '');
      setResponsavelChatId(event.tarefa?.responsavel || event.perfil || 'Confi');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setStartDate(event.dateStart);
      setEndDate(event.dateEnd || event.dateStart);
      setEditing(false);
    } else {
      setTitle('');
      setConteudoSecundario('');
      setPerfil('Confi');
      setTipo('Tarefa');
      setTarefaTitle('');
      setResponsavelChatId('');
      setLinkDrive('');
      setStartDate(start);
      setEndDate(end);
      setEditing(true);
    }
  }, [event, start, end]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title) return alert('Informe o título do evento');

    const ev: AgendaEvent = {
      id: event?.id || String(new Date().getTime()),
      dateStart: startDate,
      dateEnd: endDate,
      tipoEvento: tipo,
      conteudoPrincipal: title,
      conteudoSecundario,
      perfil,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: responsavelChatId || perfil,
            status: event?.tarefa?.status || 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : undefined,
    };

    onSave(ev, !!event);
    onClose();
  };

  const handleDelete = () => {
    if (!event) return;
    if (confirm('Deseja realmente excluir este evento?')) {
      onDelete(event.id);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>{event && !editing ? 'Detalhes do Evento' : 'Novo Evento/Tarefa'}</h2>

        {event && !editing && (
          <button onClick={() => setEditing(true)} style={{ marginBottom: 10 }}>
            ✏️ Editar
          </button>
        )}

        <label>Título:</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={!editing}
          style={input}
        />

        <label>Conteúdo Secundário:</label>
        <input
          type="text"
          value={conteudoSecundario}
          onChange={e => setConteudoSecundario(e.target.value)}
          disabled={!editing}
          style={input}
        />

        <label>Perfil:</label>
        <input
          type="text"
          value={perfil}
          onChange={e => setPerfil(e.target.value)}
          disabled={!editing}
          style={input}
        />

        <label>Tipo:</label>
        <select value={tipo} onChange={e => setTipo(e.target.value as any)} disabled={!editing} style={input}>
          <option value="Evento">Evento</option>
          <option value="Tarefa">Tarefa</option>
        </select>

        <label>Tarefa:</label>
        <input
          type="text"
          value={tarefaTitle}
          onChange={e => setTarefaTitle(e.target.value)}
          disabled={!editing}
          style={input}
        />

        <label>Responsável (ChatId):</label>
        <input
          type="text"
          value={responsavelChatId}
          onChange={e => setResponsavelChatId(e.target.value)}
          disabled={!editing}
          style={input}
        />

        <label>Link Drive:</label>
        <input
          type="text"
          value={linkDrive}
          onChange={e => setLinkDrive(e.target.value)}
          disabled={!editing}
          style={input}
        />

        <label>Início:</label>
        <input
          type="datetime-local"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          disabled={!editing}
          style={input}
        />

        <label>Fim:</label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          disabled={!editing}
          style={input}
        />

        <button onClick={handleSave} style={{ marginRight: 10 }}>
          Salvar
        </button>
        <button onClick={onClose} style={{ marginRight: 10 }}>
          Fechar
        </button>
        {event && <button onClick={handleDelete}>Excluir</button>}
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
  zIndex: 999,
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 350,
  borderRadius: 8,
};

const input: React.CSSProperties = {
  width: '100%',
  marginBottom: 10,
  padding: 8,
};
