'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { AgendaEvent, Perfil } from './types';

export default function AgendaCalendar({ userPerfil }: { userPerfil: Perfil }) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selected, setSelected] = useState<AgendaEvent | null>(null);
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    fetch('/api/agenda')
      .then(r => r.json())
      .then(setEvents);
  }, []);

  async function save(ev: AgendaEvent, edit = false) {
    const res = await fetch('/api/agenda', {
      method: edit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    const data = await res.json();

    if (!edit) setEvents(prev => [...prev, data]);
    else setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
  }

  async function remove(id: string) {
    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setEvents(prev => prev.filter(e => e.id !== id));
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        height="85vh"
        events={events
          .filter(e => e.perfil === userPerfil)
          .map(e => ({
            id: e.id,
            title: e.conteudoPrincipal,
            start: e.start,
            end: e.end,
          }))}

        select={info => {
          setSelected(null);
          setRange({ start: info.startStr, end: info.endStr });
        }}

        eventClick={info => {
          const ev = events.find(e => e.id === info.event.id);
          if (ev) {
            setSelected(ev);
            setRange({ start: ev.start, end: ev.end });
          }
        }}
      />

      {range && (
        <EventModal
          event={selected}
          start={range.start}
          end={range.end}
          perfil={userPerfil}
          onSave={save}
          onDelete={remove}
          onClose={() => setRange(null)}
        />
      )}
    </>
  );
}