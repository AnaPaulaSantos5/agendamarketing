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
  conteudoPrincipal?: string;
  perfil?: Perfil;
  tarefa?: { titulo: string; status: string; data: string } | null;
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

  const parseDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      if (dateStr.includes('/')) return `20${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
      return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
    return '';
  };

  // Busca dados da planilha e monta checklist
  useEffect(() => {
    async function fetchChecklist() {
      try {
        const res = await fetch('/api/checklist');
        const data: ChecklistItem[] = await res.json();

        // Adiciona tarefas do Agenda e Tarefas que ainda não estão na aba Checklist
        const newItems: ChecklistItem[] = [];

        // Converte eventos com tarefas em checklist
        const agendaTasks = events
          .filter(e => e.tarefa)
          .map(e => ({
            id: e.id,
            date: e.start,
            client: e.perfil || 'Confi',
            task: e.tarefa!.titulo,
            done: e.tarefa!.status === 'Concluída',
          }));

        agendaTasks.forEach(task => {
          if (!data.find(d => d.id === task.id)) newItems.push(task);
        });

        setChecklist([...data, ...newItems]);
      } catch (err) {
        console.error(err);
      }
    }
    fetchChecklist();
  }, [events]);

  // Marcar item como concluído (sai instantaneamente do checklist)
  const toggleChecklistItem = async (item: ChecklistItem) => {
    try {
      setChecklist(prev => prev.filter(c => c.id !== item.id)); // remove do estado local instantâneo
      await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, done: true }),
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar checklist');
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  const todayChecklist = checklist.filter(c => parseDate(c.date) === today);

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 1 }}>
        <div>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          selectable
          editable
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
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ width: 300, borderLeft: '1px solid #ccc', paddingLeft: 10 }}>
        <h3>Checklist Hoje</h3>
        {todayChecklist.length === 0 && <p>Nenhuma tarefa hoje</p>}
        {todayChecklist.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ flex: 1 }}>
              {item.task} ({item.client})
            </span>
            <button onClick={() => toggleChecklistItem(item)} style={{ marginLeft: 8 }}>✅</button>
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
          onSave={() => {}}
          onDelete={() => {}}
        />
      )}
    </div>
  );
}