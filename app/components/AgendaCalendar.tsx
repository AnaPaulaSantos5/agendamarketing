// AgendaCalendar.tsx
'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AgendaEvent, Perfil } from './types';

interface AgendaCalendarProps {
  events: AgendaEvent[];
  userPerfil: Perfil;
  onDateSelect?: (start: string, end: string) => void;
  onEventClick?: (ev: AgendaEvent) => void;
}

const profileColors: Record<Perfil, string> = {
  Confi: '#ffce0a',
  Luiza: '#1260c7',
  Cecília: '#f5886c',
  Júlio: '#000000',
};

export default function AgendaCalendar({
  events,
  onDateSelect,
  onEventClick,
}: AgendaCalendarProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable
      editable
      events={events.map(ev => ({
        ...ev,
        id: ev.id,
        title: ev.conteudoPrincipal || '',
        color: ev.perfil ? profileColors[ev.perfil] : '#ccc',
      }))}

      select={(info) => {
        if (!onDateSelect) return;
        onDateSelect(
          info.startStr.slice(0, 16),
          info.endStr.slice(0, 16)
        );
      }}

      eventClick={(info) => {
        if (!onEventClick) return;
        const ev = events.find(e => e.id === info.event.id);
        if (ev) onEventClick(ev);
      }}

      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      height="80vh"
    />
  );
}