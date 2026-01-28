'use client';
import React, { useState, useEffect } from 'react';

type Profile = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type AgendaEvent = {
  id?: string;
  start: string;
  end: string;
  tipoEvento?: string;
  conteudoPrincipal?: string;
  perfil?: Profile;
  tarefa?: any;
  allDay?: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: AgendaEvent) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
};

export default function EventModal({ isOpen, onClose, onSave, start, end, event }: Props) {
  const [title, setTitle] = useState('');
  const [profile, setProfile] = useState<Profile>('Confi');
  const [type, setType] = useState<'Interno' | 'Perfil'>('Perfil');
  const [linkDrive, setLinkDrive] = useState('');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setProfile(event.perfil || 'Confi');
      setType(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setAllDay(event.allDay || false);
      setStartDate(event.start);
      setEndDate(event.end);
    } else {
      setStartDate(start);
      setEndDate(end);
      setAllDay(false);
    }
  }, [event, start, end]);

  if (!isOpen) return null;

  function handleSave() {
    if (!title) return alert('Informe o título do evento');

    const eventData: AgendaEvent = {
      start: startDate,
      end: endDate,
      tipoEvento: type,
      conteudoPrincipal: title,
      perfil: profile,
      allDay,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: profile,
            data: startDate,
            status: 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : undefined,
    };

    onSave(eventData);
    onClose();

    setTitle('');
    setTarefaTitle('');
    setLinkDrive('');
    setAllDay(false);
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Novo Evento/Tarefa</h3>

        <input placeholder="Título do evento" value={title} onChange={e => setTitle(e.target.value)} style={input} />

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

        <div>
          <label>
            <input type="checkbox" checked={allDay} onChange={() => setAllDay(!allDay)} /> Dia todo
          </label>
        </div>

        {!allDay && (
          <>
            <div>
              <label>Início:</label>
              <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} style={input} />
            </div>
            <div>
              <label>Fim:</label>
              <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} style={input} />
            </div>
          </>
        )}

        <input placeholder="Título da tarefa (opcional)" value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} style={input} />
        <input placeholder="Link do Drive (opcional)" value={linkDrive} onChange={e => setLinkDrive(e.target.value)} style={input} />

        <button onClick={handleSave} style={{ ...input, backgroundColor: '#1260c7', color: '#fff' }}>
          Salvar
        </button>
        <button onClick={onClose} style={{ ...input, marginTop: '0.5rem' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
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
