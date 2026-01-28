'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal, { AgendaEvent, Profile } from './EventModal';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Profile>('Confi');
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const profiles: Profile[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateClick = (info: any) => {
    const newEvent: AgendaEvent = {
      id: '',
      start: info.dateStr,
      end: info.dateStr,
      conteudoPrincipal: '',
      perfil: filterProfile,
    };
    setSelectedEvent(newEvent);
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const ev = events.find(e => e.id === info.event.id);
    if (ev) {
      setSelectedEvent(ev);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (event: AgendaEvent, isEdit: boolean) => {
    try {
      if (isEdit && event.id) {
        await fetch('/api/agenda', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
      } else {
        await fetch('/api/agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
      }
      await fetchEvents();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      await fetchEvents();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir evento');
    }
  };

  const handleChecklistAction = async (event: AgendaEvent, action: 'Concluída' | 'Reagendar' | 'Cancelar') => {
    let updatedEvent = { ...event };
    if (action === 'Concluída') updatedEvent.tarefa = { ...updatedEvent.tarefa, status: 'Concluída' };
    if (action === 'Cancelar') updatedEvent.tarefa = { ...updatedEvent.tarefa, status: 'Cancelada' };
    if (action === 'Reagendar') {
      const newDate = prompt('Escolha nova data e hora (YYYY-MM-DDTHH:MM)', updatedEvent.start);
      if (newDate) {
        updatedEvent.start = newDate;
        updatedEvent.end = newDate;
      }
    }
    await handleSave(updatedEvent, true);
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  const today = new Date().toISOString().slice(0, 10);
  const todayEvents = filteredEvents.filter(e => e.start.slice(0, 10) === today);

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 1 }}>
        <div>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Profile)}>
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
          eventClick={handleEventClick}
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ width: 300, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todayEvents.map(e => (
            <li key={e.id} style={{ marginBottom: 10, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
              <div><b>{e.conteudoPrincipal}</b> ({e.tarefa?.status || 'Pendente'})</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                <button onClick={() => handleChecklistAction(e, 'Concluída')} style={buttonBlue}>Concluída</button>
                <button onClick={() => handleChecklistAction(e, 'Reagendar')} style={buttonGrey}>Reagendar</button>
                <button onClick={() => handleChecklistAction(e, 'Cancelar')} style={buttonRed}>Cancelar</button>
              </div>
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

const buttonBlue: React.CSSProperties = { padding: '4px 8px', backgroundColor: '#1260c7', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 };
const buttonGrey: React.CSSProperties = { padding: '4px 8px', backgroundColor: '#ccc', color: '#000', border: 'none', cursor: 'pointer', fontSize: 12 };
const buttonRed: React.CSSProperties = { padding: '4px 8px', backgroundColor: '#f44336', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 };