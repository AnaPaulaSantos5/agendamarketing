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
  perfil?: Perfil;
  statusPostagem?: string;
  tarefa?: any;
  allDay?: boolean;
};

export type ChecklistItem = {
  ID: string;
  Data: string;
  Cliente: string;
  Tarefa: string;
  Done: string;
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

    async function fetchChecklist() {
      try {
        const res = await fetch('/api/checklist');
        const data = await res.json();
        setChecklist(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchEvents();
    fetchChecklist();
  }, []);

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

  const deleteEvent = async (ev: AgendaEvent) => {
    if (!confirm('Deseja realmente excluir este evento?')) return;
    try {
      await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ev.id }),
      });
      setEvents(prev => prev.filter(e => e.id !== ev.id));
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir evento');
    }
  };

  const updateChecklistItem = async (item: ChecklistItem, done: boolean) => {
    try {
      await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.ID, done }),
      });
      setChecklist(prev => prev.map(c => (c.ID === item.ID ? { ...c, Done: done ? 'Sim' : 'Não' } : c)));
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar checklist');
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Calendário */}
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

      {/* Checklist lateral */}
      <div style={{ flex: 1 }}>
        <h3>Checklist Hoje</h3>
        {checklist
          .filter(item => item.Data === today)
          .map(item => (
            <div key={item.ID} style={{ marginBottom: 10, border: '1px solid #ccc', padding: 8, borderRadius: 4 }}>
              <strong>{item.Tarefa}</strong> ({item.Cliente}) - {item.Done}
              <div style={{ marginTop: 5 }}>
                {item.Done !== 'Sim' && (
                  <button onClick={() => updateChecklistItem(item, true)}>✅ Concluir</button>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Modal do evento */}
      {modalOpen && (
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
