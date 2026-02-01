'use client';

import { useEffect, useState } from 'react';
import AgendaCalendar from '../components/AgendaCalendar';
import { AgendaEvent, Perfil } from '../components/types';

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);

  useEffect(() => {
    async function loadAgenda() {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(data);
    }
    loadAgenda();
  }, []);

  return (
    <AgendaCalendar
      events={events}
      userPerfil={'Confi'}
      onDateSelect={(start, end) => {
        console.log('Selecionado:', start, end);
      }}
      onEventClick={(ev) => {
        console.log('Evento clicado:', ev);
      }}
    />
  );
}