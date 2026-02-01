'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { AgendaEvent } from './types';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);

  // 🔹 BUSCA EVENTOS DA PLANILHA
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(data);
    }
    load();
  }, []);

  // 🔹 SALVAR (POST / PATCH)
  async function saveEvent(ev: AgendaEvent, isEdit = false) {
    await fetch('/api/agenda', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    if (isEdit) {
      setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
    } else {
      setEvents(prev => [...prev, ev]);
    }
  }

  // 🔹 DELETE
  async function deleteEvent(id: string) {
    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setEvents(prev => prev.filter(e => e.id !== id));
    setModalOpen(false);
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        height="85vh"
        events={events.map(ev => ({
          id: ev.id,
          title: ev.conteudoPrincipal,
          start: ev.start,
          end: ev.end,
        }))}

        select={(info) => {
          setSelectedEvent(null);
          setSelectedRange({ start: info.startStr, end: info.endStr });
          setModalOpen(true);
        }}

        eventClick={(info) => {
          const ev = events.find(e => e.id === info.event.id);
          if (!ev) return;
          setSelectedEvent(ev);
          setSelectedRange({ start: ev.start, end: ev.end });
          setModalOpen(true);
        }}

        eventDrop={(info) => {
          const ev = events.find(e => e.id === info.event.id);
          if (!ev) return;
          saveEvent({ ...ev, start: info.event.startStr, end: info.event.endStr }, true);
        }}

        eventResize={(info) => {
          const ev = events.find(e => e.id === info.event.id);
          if (!ev) return;
          saveEvent({ ...ev, start: info.event.startStr, end: info.event.endStr }, true);
        }}
      />

      {modalOpen && selectedRange && (
        <EventModal
          isOpen={modalOpen}
          event={selectedEvent}
          start={selectedRange.start}
          end={selectedRange.end}
          onClose={() => setModalOpen(false)}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </>
  );
}