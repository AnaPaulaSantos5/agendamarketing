'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useSession } from 'next-auth/react';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  title: string;
  perfil?: Perfil;
  color?: string;
};

const profileColors: Record<Perfil, string> = {
  Confi: '#ffce0a',
  Luiza: '#1260c7',
  Cecília: '#f5886c',
  Júlio: '#000000',
};

type CalendarioCentralProps = {
  events: AgendaEvent[];
};

export default function CalendarioCentral({ events }: CalendarioCentralProps) {
  const { data: session } = useSession();
  const [view, setView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('timeGridWeek');

  if (!session) return <p>Carregando...</p>;

  return (
    <div style={{ flex: 1, padding: 16 }}>
      {/* Botão Visão */}
      <div style={{ marginBottom: 8 }}>
        <button onClick={() => setView('dayGridMonth')}>Mensal</button>
        <button onClick={() => setView('timeGridWeek')}>Semanal</button>
        <button onClick={() => setView('timeGridDay')}>Diária</button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        selectable
        editable={session.user.role === 'admin'}
        events={events.map((ev) => ({
          ...ev,
          color: ev.perfil ? profileColors[ev.perfil] : '#ccc',
        }))}
        height="80vh"
      />
    </div>
  );
}