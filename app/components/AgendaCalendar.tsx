'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal, { AgendaEvent, Perfil } from './EventModal';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<AgendaEvent>>({});

  useEffect(() => {
    async function fetchAgenda() {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(data || []);
    }
    fetchAgenda();
  }, []);

  const handleDateClick = (info: any) => {
    setSelectedEvent({ start: info.dateStr, end: info.dateStr });
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (event: AgendaEvent) => {
    const isEdit = Boolean(event.id);
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch('/api/agenda', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) return alert('Erro ao salvar evento');

    setEvents(prev => {
      if (isEdit) return prev.map(ev => (ev.id === event.id ? event : ev));
      else return [...prev, { ...event, id: String(prev.length + 1) }];
    });
  };

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return alert('Erro ao excluir evento');

    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <div>
          Filtrar por perfil:
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {['Confi', 'Cecília', 'Luiza', 'Júlio'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events.filter(e => e.perfil === filterProfile)}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </div>

      <div style={{ width: 250, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        <ul>
          {events
            .filter(e => e.tarefa && e.tarefa.data.startsWith(new Date().toISOString().slice(0, 10)))
            .map(e => (
              <li key={e.id}>
                <input
                  type="checkbox"
                  checked={e.tarefa?.status === 'Concluída'}
                  onChange={() =>
                    handleSave({
                      ...e,
                      tarefa: { ...e.tarefa!, status: e.tarefa?.status === 'Concluída' ? 'Pendente' : 'Concluída' },
                    })
                  }
                />{' '}
                {e.conteudoPrincipal} ({e.tarefa?.titulo})
              </li>
            ))}
        </ul>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}