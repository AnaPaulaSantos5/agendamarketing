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

  // Busca checklist combinada (Checklist + Agenda + Tarefas)
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

  // Marcar item do checklist como concluído
  const toggleChecklistItem = async (item: ChecklistItem) => {
    try {
      const updated = { ...item, done: !item.done };
      await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, done: updated.done }),
      });
      setChecklist(prev => prev.map(c => (c.id === item.id ? updated : c)));
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar checklist');
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);
  const todayChecklist = checklist.filter(c => {
    const checkDate = new Date(c.date);
    const todayDate = new Date(today);
    return (
      checkDate.getFullYear() === todayDate.getFullYear() &&
      checkDate.getMonth() === todayDate.getMonth() &&
      checkDate.getDate() === todayDate.getDate()
    );
  });

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Calendário */}
      <div style={{ flex: 2 }}>
        <div>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
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
      <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: 10 }}>
        <h3>Checklist Hoje</h3>
        {todayChecklist.length === 0 && <p>Nenhum item para hoje</p>}
        <ul>
          {todayChecklist.map(item => (
            <li key={item.id} style={{ marginBottom: 6 }}>
              {item.task} ({item.client}) - {item.done ? 'Concluído' : 'Pendente'}
              <button onClick={() => toggleChecklistItem(item)} style={{ marginLeft: 8 }}>
                ✅
              </button>
            </li>
          ))}
        </ul>
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
