'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { useState, useEffect } from 'react';
import EventModal from './EventModal';

/* =======================
TIPAGEM DO EVENTO
======================= */
export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  perfil?: Perfil;
  conteudoSecundario?: string;
  cta?: string;
  linkDrive?: string;
};

/* =======================
PROPS DO COMPONENTE
======================= */
interface AgendaCalendarProps {
  events: AgendaEvent[];
  perfis: { nome: Perfil; chatId: string }[];
  onRefresh: () => void;
  isAdmin?: boolean;
}

/* =======================
COMPONENTE
======================= */
export default function AgendaCalendar({
  events: initialEvents,
  perfis,
  onRefresh,
  isAdmin = false,
}: AgendaCalendarProps) {
  const [events, setEvents] = useState<AgendaEvent[]>(initialEvents || []);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /* =======================
  SINCRONIZA EVENTOS RECEBIDOS
  ======================== */
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  /* =======================
  CRIAR EVENTO
  ======================== */
  function handleSelect(info: DateSelectArg) {
    setSelectedEvent({
      id: crypto.randomUUID(),
      title: '',
      start: info.startStr,
      end: info.endStr,
    });
    setIsOpen(true);
  }

  /* =======================
  EDITAR EVENTO
  ======================== */
  function handleEventClick(click: EventClickArg) {
    const ev = events.find(e => e.id === click.event.id);
    if (!ev) return;

    setSelectedEvent(ev);
    setIsOpen(true);
  }

  /* =======================
  SALVAR EVENTO
  ======================== */
  function handleSave(event: AgendaEvent) {
    setEvents(prev =>
      prev.some(e => e.id === event.id)
        ? prev.map(e => (e.id === event.id ? event : e))
        : [...prev, event]
    );
    setIsOpen(false);
    setSelectedEvent(null);
    onRefresh(); // recarrega dados da planilha
  }

  /* =======================
  EXCLUIR EVENTO
  ======================== */
  function handleDelete(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id));
    setIsOpen(false);
    setSelectedEvent(null);
    onRefresh(); // recarrega dados da planilha
  }

  /* =======================
  CORES POR PERFIL
  ======================== */
  const perfilColors: Record<Perfil, string> = {
    Confi: '#ffce0a',
    Cecília: '#f5886c',
    Luiza: '#1260c7',
    Júlio: '#00b894',
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
        events={events.map(ev => ({
          id: ev.id,
          title: ev.title,
          start: ev.start,
          end: ev.end,
          backgroundColor: ev.perfil ? perfilColors[ev.perfil] : '#ccc',
        }))}
        height="auto"
      />

      {isOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          date={selectedEvent.start}
          perfis={perfis}
          isAdmin={isAdmin}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
