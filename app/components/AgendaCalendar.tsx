'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
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

  const today = new Date().toISOString().slice(0, 10);

  // Buscar eventos
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

  const handleSave = (newEvent: AgendaEvent, isEdit = false) => {
    if (isEdit) {
      // Atualizar evento existente localmente
      setEvents(prev => prev.map(e => (e.id === newEvent.id ? newEvent : e)));
    } else {
      // Criar novo evento
      setEvents(prev => [...prev, { ...newEvent, id: String(prev.length + 1) }]);
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

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
              e.id === info.event.id ? { ...e, start: info.event.startStr, end: info.event.endStr } : e
            );
            setEvents(updatedEvents);
          }}
          eventResize={info => {
            const updatedEvents = events.map(e =>
              e.id === info.event.id ? { ...e, start: info.event.startStr, end: info.event.endStr } : e
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
            .filter(e => e.start.slice(0, 10) === today && e.tarefa)
            .map(e => (
              <li key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {e.tarefa.titulo} ({e.tipoEvento})
                </span>
                <div>
                  <button
                    onClick={() => {
                      const updated = events.map(ev =>
                        ev.id === e.id ? { ...ev, tarefa: { ...ev.tarefa, status: 'Concluída' } } : ev
                      );
                      setEvents(updated);
                    }}
                    style={{ marginRight: 4 }}
                  >
                    ✅
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEvent(e);
                      setSelectedDate({ start: e.start, end: e.end });
                      setModalOpen(true);
                    }}
                  >
                    ✏️
                  </button>
                </div>
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

