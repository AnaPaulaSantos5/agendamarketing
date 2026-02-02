'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { EventClickArg, DateSelectArg } from '@fullcalendar/interaction';
import { useState, useEffect } from 'react';
import EventModal from './EventModal';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end?: string;
  title: string;
  conteudoSecundario?: string;
  perfil?: Perfil;
  linkDrive?: string;
};

export type PerfisMap = Record<Perfil, { chatId: string }>;

interface Props {
  events: AgendaEvent[];
  perfis: PerfisMap;
  onRefresh: () => void;
}

export default function AgendaCalendar({ events: initialEvents, perfis, onRefresh }: Props) {
  const [events, setEvents] = useState<AgendaEvent[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end?: string } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => setEvents(initialEvents), [initialEvents]);

  const perfilColors: Record<Perfil, string> = {
    Confi: '#ffce0a',
    Cecília: '#f5886c',
    Luiza: '#1260c7',
    Júlio: '#00b894',
  };

  function handleSelect(info: DateSelectArg) {
    setSelectedEvent({ id: '', title: '', start: info.startStr, end: info.endStr });
    setSelectedDate({ start: info.startStr, end: info.endStr });
    setModalOpen(true);
  }

  function handleEventClick(click: EventClickArg) {
    const ev = events.find((e) => e.id === click.event.id);
    if (!ev) return;
    setSelectedEvent(ev);
    setSelectedDate({ start: ev.start, end: ev.end });
    setModalOpen(true);
  }

  const handleSave = async (ev: AgendaEvent) => {
    if (!ev.id) ev.id = crypto.randomUUID();
    setEvents((prev) =>
      prev.find((e) => e.id === ev.id) ? prev.map((e) => (e.id === ev.id ? ev : e)) : [...prev, ev]
    );

    await fetch('/api/agenda', {
      method: ev.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    setModalOpen(false);
    setSelectedEvent(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/agenda?id=${id}`, { method: 'DELETE' });

    setModalOpen(false);
    setSelectedEvent(null);
    onRefresh();
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        selectable
        select={handleSelect}
        eventClick={handleEventClick}
        events={events.map((ev) => ({
          id: ev.id,
          title: ev.title,
          start: ev.start,
          end: ev.end,
          backgroundColor: ev.perfil ? perfilColors[ev.perfil] : '#ccc',
        }))}
        height="auto"
      />

      {modalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          date={selectedDate?.start || null}
          perfis={Object.entries(perfis).map(([nome, { chatId }]) => ({ nome: nome as Perfil, chatId }))}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
