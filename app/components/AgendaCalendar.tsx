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
      height="80vh"

      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}

      /*
        ⚠️ NÃO espalhar ...ev
        O FullCalendar só deve receber campos que ele entende
      */
      events={events.map(ev => ({
        id: ev.id,
        title: ev.conteudoPrincipal || '(Sem título)',
        start: ev.start,
        end: ev.end,
        allDay: ev.allDay ?? false,

        backgroundColor: ev.perfil
          ? profileColors[ev.perfil]
          : '#cccccc',

        borderColor: ev.perfil
          ? profileColors[ev.perfil]
          : '#cccccc',

        textColor: '#000000',
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
    />
  );
}