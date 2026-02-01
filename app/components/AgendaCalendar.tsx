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
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

type Props = {
  isAdmin?: boolean;
};

export default function AgendaCalendar({ isAdmin = false }: Props) {
  const { data: session } = useSession();

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const today = new Date().toISOString().slice(0, 10);

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
        const userChecklist = data.filter(
          item =>
            item.date?.slice(0, 10) === today &&
            item.client === session?.user.name // checklist só do usuário logado
        );
        setChecklist(userChecklist);
      })
      .catch(console.error);
  }, [today, session?.user.name]);

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

  // Filtra eventos: usuários podem ver eventos próprios e do Confi
  const filteredEvents = events.filter(ev => {
    if (!session?.user) return false;
    const userPerfil = session.user.name as Perfil;
    return ev.perfil === 'Confi' || ev.perfil === userPerfil;
  });

  const perfilColors: Record<Perfil, string> = {
    Confi: '#ffce0a',
    Cecília: '#f5886c',
    Luiza: '#1260c7',
    Júlio: '#00b894',
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div style={{ flex: 1 }}>
        <label style={{ marginBottom: 12, display: 'block' }}>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          editable // todos podem editar
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
      </div>

      {/* Checklist lateral direita */}
      <div style={{ width: 300 }}>
        <h3>Checklist Hoje</h3>
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
      </div>

      {modalOpen && session?.user && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
          isAdmin={isAdmin}
          userPerfil={session.user.name as Perfil}
          userChatId={session.user.email || ''}
        />
      )}
    </div>
  );
}