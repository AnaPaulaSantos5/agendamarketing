'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { AgendaEvent, Perfil } from './types';

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  /* =========================
     BUSCAR EVENTOS DA PLANILHA
  ========================== */
  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const res = await fetch('/api/agenda');
    const data = await res.json();
    setEvents(data);
  }

  /* =========================
     SALVAR / EDITAR EVENTO
  ========================== */
  async function saveEvent(ev: AgendaEvent, isEdit = false) {
    await fetch('/api/agenda', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    fetchEvents();
  }

  /* =========================
     EXCLUIR EVENTO
  ========================== */
  async function deleteEvent(id: string) {
    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    fetchEvents();
    setModalOpen(false);
  }

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* ================= CALENDÁRIO ================= */}
      <div style={{ flex: 1 }}>
        <label>
          Perfil:{' '}
          <select
            value={filterProfile}
            onChange={e => setFilterProfile(e.target.value as Perfil)}
          >
            {profiles.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>

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

          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
          }))}

          select={info => {
            setSelectedEvent(null);
            setSelectedDate({
              start: info.startStr.slice(0, 16),
              end: info.endStr.slice(0, 16),
            });
            setModalOpen(true);
          }}

          eventClick={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (!ev) return;
            setSelectedEvent(ev);
            setSelectedDate({ start: ev.start, end: ev.end });
            setModalOpen(true);
          }}

          eventDrop={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (!ev) return;
            saveEvent(
              { ...ev, start: info.event.startStr, end: info.event.endStr },
              true
            );
          }}

          eventResize={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (!ev) return;
            saveEvent(
              { ...ev, start: info.event.startStr, end: info.event.endStr },
              true
            );
          }}
        />
      </div>

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          onClose={() => setModalOpen(false)}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}