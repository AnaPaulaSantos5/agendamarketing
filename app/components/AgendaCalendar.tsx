'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import EventModal, { AgendaEvent } from './EventModal';

type Profile = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';
const profiles: Profile[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Profile>('Confi');
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Carrega eventos do Google Sheets
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, []);

  // Salvar novo evento ou editar existente
  const handleSave = async (event: AgendaEvent, isEdit: boolean) => {
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      await fetch('/api/agenda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (isEdit) {
        setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      } else {
        setEvents(prev => [...prev, { ...event, id: String(prev.length + 1) }]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  // Excluir evento/tarefa
  const handleDelete = async (eventId: string) => {
    try {
      await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId }),
      });
      setEvents(prev => prev.filter(e => e.id !== eventId));
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir evento');
    }
  };

  // Marcar tarefa como concluída
  const handleChecklistToggle = async (event: AgendaEvent) => {
    if (!event.tarefa) return;
    const updatedEvent = {
      ...event,
      tarefa: {
        ...event.tarefa,
        status: event.tarefa.status === 'Concluída' ? 'Pendente' : 'Concluída',
      },
    };
    await handleSave(updatedEvent, true);
  };

  // Reagendar tarefa
  const handleReschedule = (event: AgendaEvent) => {
    const newDate = prompt('Informe nova data/hora (YYYY-MM-DD HH:MM):', event.start);
    if (!newDate) return;
    const updatedEvent = { ...event, start: newDate, end: newDate };
    handleSave(updatedEvent, true);
  };

  const handleDateClick = (info: DateSelectArg) => {
    const newEvent: AgendaEvent = {
      id: '',
      start: info.startStr,
      end: info.endStr || info.startStr,
      perfil: filterProfile,
      conteudoPrincipal: '',
    };
    setSelectedEvent(newEvent);
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (!event) return;
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {/* Calendário */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 10 }}>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Profile)}>
            {profiles.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          selectable={true}
          select={handleDateClick}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
          }))}
          eventClick={handleEventClick}
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ width: 280, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events.filter(e => e.tarefa && e.start.slice(0, 10) === new Date().toISOString().slice(0, 10))
            .map(e => (
              <li key={e.id} style={{ marginBottom: 6, borderBottom: '1px solid #eee', paddingBottom: 4 }}>
                <strong>{e.conteudoPrincipal}</strong> - {e.tarefa!.titulo} ({e.tarefa!.status})
                <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
                  <button onClick={() => handleChecklistToggle(e)}>
                    {e.tarefa!.status === 'Concluída' ? '✅ Desmarcar' : '☑️ Concluir'}
                  </button>
                  <button onClick={() => handleReschedule(e)}>⏰ Reagendar</button>
                </div>
              </li>
            ))}
        </ul>
      </div>

      {/* Modal de evento */}
      {selectedEvent && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          event={selectedEvent}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}