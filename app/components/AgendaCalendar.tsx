'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  perfil?: Perfil;
  tarefa?: any;
  allDay?: boolean;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
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

  const handleSave = async (newEvent: AgendaEvent) => {
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      setEvents(prev => [...prev, { ...newEvent, id: String(prev.length + 1) }]);
    } catch (err) {
      console.error('Erro ao salvar evento', err);
      alert('Erro ao salvar evento');
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Calendário */}
      <div style={{ flex: 1 }}>
        <div>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          editable={true}
          selectable={true}
          selectMirror={true}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
            allDay: ev.allDay || false,
          }))}
          select={info => {
            setSelectedEvent(null);
            setSelectedDate({ start: info.startStr, end: info.endStr });
            setModalOpen(true);
          }}
          eventClick={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (ev) {
              setSelectedEvent(ev);
              setSelectedDate({ start: ev.start, end: ev.end });
              setModalOpen(true);
            }
          }}
          eventDrop={info => {
            const updatedEvents = events.map(e =>
              e.id === info.event.id
                ? { ...e, start: info.event.startStr, end: info.event.endStr }
                : e
            );
            setEvents(updatedEvents);
          }}
          eventResize={info => {
            const updatedEvents = events.map(e =>
              e.id === info.event.id
                ? { ...e, start: info.event.startStr, end: info.event.endStr }
                : e
            );
            setEvents(updatedEvents);
          }}
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ width: 250, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        <ul>
          {events
            .filter(e => e.start.slice(0, 10) === today)
            .map(e => (
              <li key={e.id}>
                {e.conteudoPrincipal} ({e.tipoEvento})
              </li>
            ))}
        </ul>
      </div>

      {/* Modal */}
      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedDate.start}
          end={selectedDate.end}
          onSave={handleSave}
          event={selectedEvent}
        />
      )}
    </div>
  );
}
