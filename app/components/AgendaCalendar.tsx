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
  tipoEvento?: 'Interno' | 'Perfil';
  conteudoPrincipal?: string;
  perfil?: Perfil;
  tarefa?: { titulo: string; status: string; data: string; linkDrive?: string; notificar?: string } | null;
  allDay?: boolean;
};

export type ChecklistItem = {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
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

  // Busca checklist
  useEffect(() => {
    async function fetchChecklist() {
      try {
        const res = await fetch('/api/checklist');
        const data = await res.json();
        setChecklist(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchChecklist();
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

      // Atualiza checklist instantaneamente se for tarefa do dia
      if (ev.tarefa && ev.start.slice(0, 10) === today) {
        setChecklist(prev => [
          ...prev,
          {
            id: ev.id,
            date: ev.start,
            client: ev.perfil || 'Confi',
            task: ev.tarefa.titulo,
            done: ev.tarefa.status === 'Concluída',
          },
        ]);
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
      setChecklist(prev => prev.filter(c => c.id !== id)); // remove do checklist também
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir evento');
    }
  };

  // Marcar item do checklist como concluído
  const toggleChecklistItem = async (item: ChecklistItem) => {
    try {
      const updated = { ...item, done: true };
      await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, done: true }),
      });
      // Remove imediatamente da lista
      setChecklist(prev => prev.filter(c => c.id !== item.id));
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar checklist');
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);
  const todayChecklist = checklist.filter(c => c.date.slice(0, 10) === today);

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 3 }}>
        <div>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

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

      <div style={{ flex: 1 }}>
        <h3>Checklist Hoje</h3>
        <ul>
          {todayChecklist.map(item => (
            <li key={item.id} style={{ marginBottom: 10 }}>
              {item.task} ({item.client}) - {item.done ? 'Concluído' : 'Pendente'}
              <button onClick={() => toggleChecklistItem(item)} style={{ marginLeft: 8 }}>✅</button>
            </li>
          ))}
        </ul>
      </div>

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