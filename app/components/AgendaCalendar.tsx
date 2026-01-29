'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { AgendaEvent, Perfil } from '../types';

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });

  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error('Erro da API:', err);
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
    fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    }).catch(err => console.error('Erro ao salvar evento', err));
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  return (
    <div style={{ display: 'flex' }}>
      {/* Calendário */}
      <div style={{ flex: 1 }}>
        <div>
          Filtrar por perfil: 
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => <option key={p} value={p}>{p}</option>)}
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

      {/* Checklist lateral */}
      <div style={{ width: 250, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        <ul>
          {events
            .filter(e => e.start.startsWith(new Date().toISOString().slice(0, 10)) && e.perfil === filterProfile)
            .map(e => (
              <li key={e.id}>{e.conteudoPrincipal} ({e.tipoEvento})</li>
            ))}
        </ul>
      </div>

      {/* Modal */}
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