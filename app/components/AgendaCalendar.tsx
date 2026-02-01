'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AgendaEvent, Perfil } from './types';

interface AgendaCalendarProps {
  events: AgendaEvent[];
  userPerfil: Perfil;
}

export default function AgendaCalendar({ events, userPerfil }: AgendaCalendarProps) {
  const getEventColor = (perfil?: Perfil) => {
    switch (perfil) {
      case 'Confi':
        return '#ffce0a';
      case 'Luiza':
        return '#1260c7';
      case 'Cecília':
        return '#f5886c';
      default:
        return '#999';
    }
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable
      editable
      events={events.map(ev => ({
        ...ev,
        title: ev.conteudoPrincipal,
        color: getEventColor(ev.perfil),
      }))}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
    />
  );
}