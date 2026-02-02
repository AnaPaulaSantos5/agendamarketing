'use client';

import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  perfil?: string;
}

interface Props {
  events: CalendarEvent[];
  onSelect: (start: string, end: string) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export default function AgendaCalendar({
  events,
  onSelect,
  onEventClick,
}: Props) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      selectable
      select={(info) => onSelect(info.startStr, info.endStr)}
      events={events}
      eventClick={(info) =>
        onEventClick({
          id: info.event.id,
          title: info.event.title,
          start: info.event.startStr,
          end: info.event.endStr ?? undefined,
          perfil: info.event.extendedProps?.perfil,
        })
      }
      height="auto"
    />
  );
}
