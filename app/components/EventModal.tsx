'use client';
import React, { useState, useEffect } from 'react';
import { AgendaEvent } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
};

export default function EventModal({ isOpen, onClose, onSave, start, end, event }: Props) {
  const [title, setTitle] = useState('');
  const [perfil, setPerfil] = useState<'Confi' | 'Cecília' | 'Luiza' | 'Júlio'>('Confi');
  const [tipo, setTipo] = useState<'Interno' | 'Perfil'>('Perfil');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [editing, setEditing] = useState(false);

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
      setEditing(true);
      setStartDate(start);
      setEndDate(end);
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
            responsavel: perfil,
            data: startDate,
            status: event?.tarefa?.status || 'Pendente',
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
        <h3>{event && !editing ? 'Detalhes do Evento' : 'Novo Evento/Tarefa'}</h3>

        {event && !editing && (
          <button onClick={() => setEditing(true)} style={{ marginBottom: 10 }}>
            ✏️ Editar
          </button>
        )}

        {(editing || !event) && (
          <>
            <input placeholder="Título do evento" value={title} onChange={e => setTitle(e.target.value)} style={input} />
            <select value={perfil} onChange={e => setPerfil(e.target.value as any)} style={input}>
              <option>Confi</option>
              <option>Cecília</option>
              <option>Luiza</option>
              <option>Júlio</option>
            </select>
            <select value={tipo} onChange={e => setTipo(e.target.value as any)} style={input}>
              <option value="Perfil">Perfil</option>
              <option value="Interno">Interno</option>
            </select>
            <input placeholder="Título da tarefa" value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} style={input} />
            <input placeholder="Link do Drive" value={linkDrive} onChange={e => setLinkDrive(e.target.value)} style={input} />

            <label>Início:</label>
            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} style={input} />
            <label>Fim:</label>
            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} style={input} />

            <button onClick={handleSave} style={{ ...input, backgroundColor: '#1260c7', color: '#fff' }}>
              Salvar
            </button>
          </>
        )}

        <button onClick={onClose} style={{ ...input, marginTop: 8 }}>
          Fechar
        </button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 };
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 350, borderRadius: 8 };
const input: React.CSSProperties = { width: '100%', marginBottom: 10, padding: 8 };
