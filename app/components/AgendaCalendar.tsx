'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useSession } from 'next-auth/react';
import EventModal from './EventModal';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  tipoEvento?: string;
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
};

export type ChecklistItem = {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const userPerfil = session?.user?.perfil as Perfil;
  const userChatId = session?.user?.responsavelChatId || '';

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil | 'Todos'>('Todos');

  const [perfilConfig, setPerfilConfig] = useState<Record<Perfil, {
    chatId: string;
    image: string;
  }>>({
    Confi: { chatId: '', image: '/images/confi.png' },
    Cecília: { chatId: '', image: '/images/cecilia.png' },
    Luiza: { chatId: '', image: '/images/luiza.png' },
    Júlio: { chatId: '', image: '/images/julio.png' },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });

  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch('/api/checklist')
      .then(res => res.json())
      .then(setChecklist)
      .catch(console.error);
  }, []);

  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    await fetch('/api/agenda', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    setEvents(prev =>
      isEdit ? prev.map(e => (e.id === ev.id ? ev : e)) : [...prev, ev]
    );
  };

  const deleteEvent = async (id: string) => {
    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setEvents(prev => prev.filter(e => e.id !== id));
    setModalOpen(false);
  };

  const filteredEvents = events.filter(
    e => filterProfile === 'Todos' || e.perfil === filterProfile
  );

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Painel esquerdo */}
      <div style={{ width: 260 }}>
        <h3>Perfis</h3>

        {isAdmin && profiles.map(p => (
          <div key={p}>
            <strong>{p}</strong>
            <input
              style={{ width: '100%' }}
              placeholder="ChatId"
              value={perfilConfig[p].chatId}
              onChange={e =>
                setPerfilConfig(prev => ({
                  ...prev,
                  [p]: { ...prev[p], chatId: e.target.value }
                }))
              }
            />
          </div>
        ))}
      </div>

      {/* Calendário */}
      <div style={{ flex: 1 }}>
        <select
          value={filterProfile}
          onChange={e => setFilterProfile(e.target.value as any)}
        >
          <option value="Todos">Todos</option>
          {profiles.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          editable
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
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
        />
      </div>

      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={saveEvent}
          onDelete={deleteEvent}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          perfilConfig={perfilConfig}
          userPerfil={userPerfil}
          userChatId={userChatId}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
