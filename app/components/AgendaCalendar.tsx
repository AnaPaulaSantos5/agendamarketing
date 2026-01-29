'use client';
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    data: string;
    status: string;
    linkDrive?: string;
    notificar?: string;
  } | null;
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

  // Busca eventos
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, []);

  // Salvar ou editar evento
  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    try {
      if (isEdit) {
        await fetch('/api/agenda', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ev),
        });
        setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
      } else {
        await fetch('/api/agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ev),
        });
        setEvents(prev => [...prev, ev]);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  // Excluir evento
  const deleteEvent = async (id: string) => {
    try {
      await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setEvents(prev => prev.filter(e => e.id !== id));
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir evento');
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      {/* Calendário */}
      <div style={{ flex: 3 }}>
        <label>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          selectable={true}
          editable={true}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
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
            const ev = events.find(e => e.id === info.event.id);
            if (ev) saveEvent({ ...ev, start: info.event.startStr, end: info.event.endStr }, true);
          }}
          eventResize={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (ev) saveEvent({ ...ev, start: info.event.startStr, end: info.event.endStr }, true);
          }}
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ flex: 1 }}>
        <h3>Checklist Hoje</h3>
        {events
          .filter(e => e.tarefa && new Date(e.start).toLocaleDateString() === new Date(today).toLocaleDateString())
          .map(e => (
            <div key={e.id} style={{ marginBottom: 8 }}>
              <span>{e.tarefa?.titulo} ({e.tipoEvento}) - {e.tarefa?.status}</span>
              <button
                onClick={() =>
                  saveEvent({ ...e, tarefa: { ...e.tarefa!, status: 'Concluída' } }, true)
                }
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
          ))}
      </div>

      {/* Modal */}
      {modalOpen && selectedDate.start && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}
