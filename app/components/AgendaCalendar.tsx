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
  const [filterProfile, setFilterProfile] = useState('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const today = new Date().toISOString().slice(0, 10);

  // Eventos
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  // Checklist
  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const res = await fetch('/api/checklist');
      const data = await res.json();
      setChecklist(data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleChecklistItem = async (item: ChecklistItem) => {
    try {
      // Atualiza instantaneamente no estado
      setChecklist(prev => prev.filter(c => c.id !== item.id));

      await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar checklist');
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);
  const todayChecklist = checklist.filter(c => c.date.slice(0, 10) === today);

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 1 }}>
        <div>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          selectable
          editable
          events={filteredEvents.map(ev => ({ id: ev.id, title: ev.conteudoPrincipal, start: ev.start, end: ev.end }))}
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
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ width: 300 }}>
        <h3>Checklist Hoje</h3>
        {todayChecklist.length === 0 && <p>Nenhuma tarefa hoje!</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todayChecklist.map(item => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>{item.task} ({item.client})</span>
              <button onClick={() => toggleChecklistItem(item)}>✅</button>
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
          event={selectedEvent}
          onSave={() => {}}
          onDelete={() => {}}
        />
      )}
    </div>
  );
}