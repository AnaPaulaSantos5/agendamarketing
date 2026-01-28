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
  title: string;
  start: string;
  end: string;
  tipoEvento?: string;
  perfil?: Perfil;
  linkDrive?: string;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Carregar agenda da planilha
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

  // Filtra por perfil
  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  // Clique no calendário
  const handleDateClick = (info: any) => {
    setFormData({ start: info.dateStr, end: info.dateStr });
    setModalOpen(true);
  };

  // Salvar evento
  const handleSave = async (newEvent: AgendaEvent) => {
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      setEvents(prev => [...prev, newEvent]);
    } catch (err) {
      console.error('Erro ao salvar evento', err);
      alert('Erro ao salvar evento');
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 10 }}>
          Filtrar por perfil:
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
            id: ev.id,
            title: ev.title,
            start: ev.start,
            end: ev.end,
          }))}
          dateClick={handleDateClick}
          height="auto"
        />
      </div>

      {/* Modal de evento */}
      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          start={formData.start}
          end={formData.end}
        />
      )}
    </div>
  );
}
