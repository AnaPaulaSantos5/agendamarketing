'use client';
import React, { useState, useEffect } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

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
  const [perfil, setPerfil] = useState<Perfil>('Confi');
  const [tipo, setTipo] = useState<'Interno' | 'Perfil'>('Perfil');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || 'Confi');
      setTipo(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setStartDate(event.start);
      setEndDate(event.end);
      setEditing(false);
    } else {
      setTitle('');
      setPerfil('Confi');
      setTipo('Perfil');
      setTarefaTitle('');
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
      start: startDate,
      end: endDate,
      conteudoPrincipal: title,
      perfil,
      tipoEvento: tipo,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            status: event?.tarefa?.status || 'Pendente',
            data: startDate,
            linkDrive,
            notificar: 'Sim',
          }
        : null,
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
          <button onClick={() => setEditing(true)} style={{ marginBottom: 10 }}>✏️ Editar</button>
        )}

        <div>
          <label>Título:</label>
          <input value={title} onChange={e => setTitle(e.target.value)} disabled={!editing} style={input} />

          <label>Perfil:</label>
          <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)} disabled={!editing} style={input}>
            <option>Confi</option>
            <option>Cecília</option>
            <option>Luiza</option>
            <option>Júlio</option>
          </select>

          <label>Tipo:</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as 'Interno' | 'Perfil')} disabled={!editing} style={input}>
            <option>Perfil</option>
            <option>Interno</option>
          </select>

          <label>Tarefa:</label>
          <input value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} disabled={!editing} style={input} />

          <label>Link Drive:</label>
          <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)} disabled={!editing} style={input} />

          <label>Início:</label>
          <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={!editing} style={input} />

          <label>Fim:</label>
          <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={!editing} style={input} />
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleSave}>Salvar</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>Fechar</button>
          {event && <button onClick={handleDelete} style={{ marginLeft: 10 }}>Excluir</button>}
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