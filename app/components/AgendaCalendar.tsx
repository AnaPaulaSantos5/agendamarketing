'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { useSession } from 'next-auth/react';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

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

  perfil?: Perfil;

  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    responsavelChatId?: string;
    data: string;
    status: string;
    linkDrive?: string;
    notificar?: string;
  } | null;

  allDay?: boolean;
};

export type ChecklistItem = {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
  responsavel: Perfil;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

type FilterProfile = Perfil | 'Todos';

type Props = {
  isAdmin?: boolean;
};

export default function AgendaCalendar({ isAdmin = false }: Props) {
  const { data: session } = useSession();

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filterProfile, setFilterProfile] = useState<FilterProfile>('Todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const today = new Date().toISOString().slice(0, 10);

  const userPerfil = session?.user.perfil as Perfil;

  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/checklist')
      .then(res => res.json())
      .then((data: ChecklistItem[]) => {
        const todayTasks = data.filter(
          item =>
            item.date?.slice(0, 10) === today &&
            !item.done &&
            item.responsavel === userPerfil
        );
        setChecklist(todayTasks);
      })
      .catch(console.error);
  }, [today, userPerfil]);

  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    const method = isEdit ? 'PATCH' : 'POST';

    await fetch('/api/agenda', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    if (isEdit) {
      setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
    } else {
      setEvents(prev => [...prev, ev]);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!isAdmin) return alert('Somente admins podem excluir eventos');

    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setEvents(prev => prev.filter(e => e.id !== id));
    setChecklist(prev => prev.filter(c => c.id !== id));
    setModalOpen(false);
  };

  const toggleChecklistItem = async (item: ChecklistItem) => {
    setChecklist(prev => prev.filter(c => c.id !== item.id));

    await fetch('/api/checklist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
  };

  const filteredEvents =
    filterProfile === 'Todos'
      ? events
      : events.filter(e => e.perfil === filterProfile);

  const perfilColors: Record<Perfil, string> = {
    Confi: '#ffce0a',
    Cecília: '#f5886c',
    Luiza: '#1260c7',
    Júlio: '#00b894',
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Lateral perfil */}
      <div style={{ width: 200, padding: 16, borderRight: '1px solid #ccc' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={`https://ui-avatars.com/api/?name=${userPerfil}&background=0D8ABC&color=fff&rounded=true`}
            alt="Foto do usuário"
            style={{ width: 50, height: 50, borderRadius: '50%' }}
          />
          <div>
            <strong>{userPerfil}</strong>
            <p style={{ fontSize: 12, margin: 0 }}>Chat ID: {session?.user.responsavelChatId}</p>
            {isAdmin && <p style={{ fontSize: 12, margin: 0 }}>Admin</p>}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <label>
            Filtrar por perfil:{' '}
            <select
              value={filterProfile}
              onChange={e => setFilterProfile(e.target.value as FilterProfile)}
            >
              <option value="Todos">Todos</option>
              {profiles.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Calendário e checklist */}
      <div style={{ flex: 1 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          editable // todos podem criar/editar
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
            backgroundColor: ev.perfil ? perfilColors[ev.perfil] : '#999',
            borderColor: '#000',
            textColor: '#000',
          }))}
          select={info => {
            setSelectedEvent(null);
            setSelectedDate({ start: info.startStr, end: info.endStr });
            setModalOpen(true);
          }}
          eventClick={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (ev) {
              setSelectedEvent(ev);
              setSelectedDate({ start: ev.start, end: ev.end });
              setModalOpen(true);
            }
          }}
          eventDrop={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (ev) saveEvent({ ...ev, start: info.event.startStr, end: info.event.endStr }, true);
          }}
          eventResize={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (ev) saveEvent({ ...ev, start: info.event.startStr, end: info.event.endStr }, true);
          }}
          height="auto"
        />

        <h3 style={{ marginTop: 24 }}>Checklist Hoje</h3>
        {checklist.length === 0 && <p>Sem tarefas para hoje ✅</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {checklist.map(item => (
            <li key={item.id} style={{ marginBottom: 6 }}>
              {item.task} ({item.client})
              <button
                style={{
                  marginLeft: 8,
                  background: '#1260c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
                onClick={() => toggleChecklistItem(item)}
              >
                ✅
              </button>
            </li>
          ))}
        </ul>

        {modalOpen && (
          <EventModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            start={selectedDate.start}
            end={selectedDate.end}
            event={selectedEvent}
            onSave={saveEvent}
            onDelete={deleteEvent}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
}