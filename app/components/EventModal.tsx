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
  const [secondaryContent, setSecondaryContent] = useState('');
  const [cta, setCta] = useState('');
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [responsavelChatId, setResponsavelChatId] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || 'Confi');
      setTipo(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setSecondaryContent(event.conteudoSecundario || '');
      setCta(event.cta || '');
      setStartDate(event.start);
      setEndDate(event.end);
      setResponsavelChatId(event.responsavelChatId || '');
      setEditing(false);
    } else {
      setTitle('');
      setPerfil('Confi');
      setTipo('Perfil');
      setTarefaTitle('');
      setLinkDrive('');
      setSecondaryContent('');
      setCta('');
      setStartDate(start);
      setEndDate(end);
      setResponsavelChatId('');
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
      tipo,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: perfil,
            data: startDate,
            status: 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : null,
      conteudoSecundario: secondaryContent,
      cta: cta,
      statusPostagem: 'Pendente',
      responsavelChatId,
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

        {event && !editing && <button onClick={() => setEditing(true)}>✏️ Editar</button>}

        <label>Título do Evento (Conteúdo Principal):</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={!editing} style={input} />

        <label>Perfil:</label>
        <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)} disabled={!editing} style={input}>
          <option>Confi</option>
          <option>Cecília</option>
          <option>Luiza</option>
          <option>Júlio</option>
        </select>

        <label>Tipo do Evento:</label>
        <select value={tipo} onChange={e => setTipo(e.target.value as any)} disabled={!editing} style={input}>
          <option>Perfil</option>
          <option>Interno</option>
        </select>

        <label>Tarefa (opcional):</label>
        <input type="text" value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} disabled={!editing} style={input} />

        <label>Link Drive (opcional):</label>
        <input type="text" value={linkDrive} onChange={e => setLinkDrive(e.target.value)} disabled={!editing} style={input} />

        <label>Conteúdo Secundário (opcional):</label>
        <input type="text" value={secondaryContent} onChange={e => setSecondaryContent(e.target.value)} disabled={!editing} style={input} />

        <label>CTA (opcional):</label>
        <input type="text" value={cta} onChange={e => setCta(e.target.value)} disabled={!editing} style={input} />

        <label>Responsável (ChatId) (opcional, para envio de WA):</label>
        <input type="text" value={responsavelChatId} onChange={e => setResponsavelChatId(e.target.value)} disabled={!editing} style={input} />

        <label>Início:</label>
        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={!editing} style={input} />

        <label>Fim:</label>
        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={!editing} style={input} />

        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose}>Fechar</button>
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
  width: 400,
  borderRadius: 8,
};

const input: React.CSSProperties = {
  width: '100%',
  marginBottom: 10,
  padding: 8,
};
