'use client';
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { AgendaEvent, Perfil } from '@/lib/types';

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState({ start: '', end: '' });

  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAgenda();
  }, []);

  const handleDateClick = (info: any) => {
    setSelectedDate({ start: info.dateStr, end: info.dateStr });
    setModalOpen(true);
  };

  const handleSave = (newEvent: AgendaEvent) => {
    setEvents(prev => [...prev, newEvent]);
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 10 }}>
          Filtrar por perfil: 
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)} style={{ marginLeft: 5 }}>
            {profiles.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
          }))}
          dateClick={handleDateClick}
        />
      </div>

      <div style={{ width: 250, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        <ul>
          {events.filter(e => e.start.startsWith(today)).map(e => (
            <li key={e.id}>
              {e.conteudoPrincipal} ({e.tipoEvento}) - {e.start.slice(11,16)} às {e.end.slice(11,16)}
            </li>
          ))}
        </ul>
      </div>

      <EventModal
        isOpen={modalOpen}
        start={selectedDate.start}
        end={selectedDate.end}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}