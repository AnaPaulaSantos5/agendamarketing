'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type AgendaEvent = {
  id?: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  perfil?: Perfil;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

function onlyDate(dateStr: string) {
  return dateStr?.split('T')[0];
}

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  async function fetchAgenda() {
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro da API:', err);
    }
  }

  useEffect(() => {
    fetchAgenda();
  }, []);

  const handleDateClick = (info: any) => {
    const iso = new Date(info.date).toISOString();
    setSelectedDate({ start: iso, end: iso });
    setModalOpen(true);
  };

  const handleSave = async (newEvent: AgendaEvent) => {
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      await fetchAgenda();
      setModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar evento', err);
      alert('Erro ao salvar evento');
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 8 }}>
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
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={filteredEvents.map(ev => ({
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
          }))}
          dateClick={handleDateClick}
        />
      </div>

      <div style={{ width: 260, padding: 12, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        <ul>
          {events
            .filter(e => onlyDate(e.start) === today)
            .map((e, i) => (
              <li key={i}>
                {e.conteudoPrincipal} ({e.tipoEvento})
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