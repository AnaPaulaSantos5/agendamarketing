'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import EventModal from './EventModal';

// Tipagem
export type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  perfil?: string;
  driveLink?: string;
};

export type Perfil = {
  nome: string;
  chatId: string;
};

export type PerfilsMap = Record<string, Perfil>; // <--- corrigido de PerfisMap para PerfilsMap

interface AgendaCalendarProps {
  events: AgendaEvent[];
  perfis: PerfilsMap;
  onRefresh: () => void;
}

export default function AgendaCalendar({ events, perfis, onRefresh }: AgendaCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Criar evento
  function handleSelect(info: any) {
    setSelectedEvent({
      id: '',
      title: '',
      start: info.startStr,
      end: info.endStr,
    });
    setIsOpen(true);
  }

  // Editar evento
  function handleEventClick(click: any) {
    setSelectedEvent({
      id: String(click.event.id),
      title: click.event.title,
      start: click.event.startStr,
      end: click.event.endStr || undefined,
      perfil: click.event.extendedProps?.perfil,
      driveLink: click.event.extendedProps?.driveLink,
    });
    setIsOpen(true);
  }

  function handleSave(event: AgendaEvent) {
    const exists = events.find(e => e.id === event.id);
    if (exists) {
      // Editar
      exists.title = event.title;
      exists.start = event.start;
      exists.end = event.end;
      exists.perfil = event.perfil;
      exists.driveLink = event.driveLink;
    } else {
      // Criar
      events.push({ ...event, id: crypto.randomUUID() });
    }
    onRefresh();
    setIsOpen(false);
    setSelectedEvent(null);
  }

  function handleDelete(id: string) {
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) events.splice(index, 1);
    onRefresh();
    setIsOpen(false);
    setSelectedEvent(null);
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        selectable
        select={handleSelect}
        eventClick={handleEventClick}
        events={events}
        height="auto"
      />

      {isOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          date={selectedEvent.start}
          perfis={Object.values(perfis)}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
