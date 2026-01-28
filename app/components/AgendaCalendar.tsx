'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventInput, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

type Profile = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

const profiles: Profile[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [filterProfile, setFilterProfile] = useState<Profile>('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [range, setRange] = useState<{ start: string; end: string } | null>(null);

  function handleSelect(info: DateSelectArg) {
    setRange({ start: info.startStr, end: info.endStr });
    setModalOpen(true);
  }

  function handleSave(event: EventInput) {
    setEvents(prev => [...prev, event]);
  }

  function handleEventClick(info: EventClickArg) {
    const p = info.event.extendedProps;
    alert(
      `Título: ${info.event.title}\nPerfil: ${p.profile}\nTipo: ${p.type}\nRoteiro: ${p.linkDrive || '—'}`
    );
  }

  const filteredEvents = events.filter(
    (e: any) => e.extendedProps.profile === filterProfile
  );

  return (
    <div style={{ padding: 20 }}>
      <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Profile)}>
        {profiles.map(p => <option key={p}>{p}</option>)}
      </select>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        select={handleSelect}
        eventClick={handleEventClick}
        events={filteredEvents}
        height="auto"
      />

      {range && (
        <EventModal
          isOpen={modalOpen}
          start={range.start}
          end={range.end}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}