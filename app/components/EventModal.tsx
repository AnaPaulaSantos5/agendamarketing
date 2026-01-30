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
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [cta, setCta] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || 'Confi');
      setTipo(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setStartDate(event.start);
      setEndDate(event.end);
      setConteudoSecundario(event.conteudoSecundario || '');
      setCta(event.cta || '');
      setResponsavelChatId(event.tarefa?.responsavelChatId || '');
      setEditing(false);
    } else {
      setTitle('');
      setPerfil('Confi');
      setTipo('Perfil');
      setTarefaTitle('');
      setLinkDrive('');
      setStartDate(start);
      setEndDate(end);
      setConteudoSecundario('');
      setCta('');
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
      conteudoSecundario,
      cta,
      perfil,
      tipoEvento: tipo,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: perfil,
            status: event?.tarefa?.status || 'Pendente',
            data: startDate,
            linkDrive,
            notificar: 'Sim',
            responsavelChatId,
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

  const inputStyle: React.CSSProperties = { width: '100%', marginBottom: 10, padding: 8 };
  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 };
  const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 350, borderRadius: 8 };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{event && !editing ? 'Detalhes do Evento' : 'Novo Evento/Tarefa'}</h3>

        {event && !editing && (
          <button onClick={() => setEditing(true)} style={{ marginBottom: 10 }}>✏️ Editar</button>
        )}

        <label>Título:</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} disabled={!editing} style={inputStyle} />

        <label>Perfil:</label>
        <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)} disabled={!editing} style={inputStyle}>
          <option value="Confi">Confi</option>
          <option value="Cecília">Cecília</option>
          <option value="Luiza">Luiza</option>
          <option value="Júlio">Júlio</option>
        </select>

        <label>Tipo:</label>
        <select value={tipo} onChange={e => setTipo(e.target.value as any)} disabled={!editing} style={inputStyle}>
          <option value="Perfil">Perfil</option>
          <option value="Interno">Interno</option>
        </select>

        <label>Tarefa:</label>
        <input type="text" value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} disabled={!editing} style={inputStyle} />

        <label>Link Drive:</label>
        <input type="text" value={linkDrive} onChange={e => setLinkDrive(e.target.value)} disabled={!editing} style={inputStyle} />

        <label>Conteúdo Secundário:</label>
        <input type="text" value={conteudoSecundario} onChange={e => setConteudoSecundario(e.target.value)} disabled={!editing} style={inputStyle} />

        <label>CTA:</label>
        <input type="text" value={cta} onChange={e => setCta(e.target.value)} disabled={!editing} style={inputStyle} />

        <label>Responsável Chat ID:</label>
        <input type="text" value={responsavelChatId} onChange={e => setResponsavelChatId(e.target.value)} disabled={!editing} style={inputStyle} />

        <label>Início:</label>
        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={!editing} style={inputStyle} />

        <label>Fim:</label>
        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={!editing} style={inputStyle} />

        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose}>Fechar</button>
        {event && <button onClick={handleDelete}>Excluir</button>}
      </div>
    </div>
  );
}
