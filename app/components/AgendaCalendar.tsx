'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export type Perfil = string;

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  perfil: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    responsavelChatId: string;
    data: string;
    status: string;
    linkDrive?: string;
    notificar?: string;
  } | null;
};

type Props = {
  events: AgendaEvent[];
  onSelect: (start: string, end: string) => void;
  onEventClick: (event: AgendaEvent) => void;
};

export default function AgendaCalendar({
  events,
  onSelect,
  onEventClick,
}: Props) {
  return (
    <div style={{ padding: 12 }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="pt-br"
        height="auto"
        selectable
        editable={false}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        select={info => onSelect(info.startStr, info.endStr)}
        events={events.map(ev => ({
          id: ev.id,
          title: ev.conteudoPrincipal,
          start: ev.start,
          end: ev.end,
        }))}
        eventClick={info => {
          const found = events.find(e => e.id === info.event.id);
          if (found) onEventClick(found);
        }}
      />
    </div>
  );
}
