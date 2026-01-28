'use client';
import React, { useState, useEffect } from 'react';
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
  conteudoPrincipal: string; // obrigatório
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
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Checklist lateral
  const [tasksToday, setTasksToday] = useState<AgendaEvent[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(data || []);
      updateTasks(data || []);
    } catch (err) {
      console.error('Erro ao buscar eventos', err);
    }
  };

  const updateTasks = (allEvents: AgendaEvent[]) => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = allEvents.filter(e => e.start.slice(0, 10) === today);
    setTasksToday(todayTasks);
  };

  const handleDateClick = (info: any) => {
    setSelectedEvent({
      id: '',
      start: info.dateStr,
      end: info.dateStr,
      conteudoPrincipal: '',
      perfil: filterProfile,
      tarefa: null,
    });
    setIsModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const ev = events.find(e => e.id === info.event.id);
    if (!ev) return;
    setSelectedEvent(ev);
    setIsModalOpen(true);
  };

  const handleSave = async (event: AgendaEvent, isEdit: boolean) => {
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      await fetch('/api/agenda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      // Atualiza state local
      setEvents(prev => {
        if (isEdit) {
          return prev.map(ev => (ev.id === event.id ? event : ev));
        } else {
          return [...prev, { ...event, id: String(prev.length + 1) }];
        }
      });
      updateTasks([...events, event]);
    } catch (err) {
      console.error('Erro ao salvar evento', err);
      alert('Erro ao salvar evento');
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Deseja realmente excluir este evento?')) return;
    try {
      await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId }),
      });
      const updated = events.filter(e => e.id !== eventId);
      setEvents(updated);
      updateTasks(updated);
    } catch (err) {
      console.error('Erro ao excluir evento', err);
      alert('Erro ao excluir evento');
    }
  };

  const handleTaskAction = async (task: AgendaEvent, action: 'concluida' | 'reagendar' | 'cancelar') => {
    if (!task.tarefa) return;

    const updatedTask = { ...task, tarefa: { ...task.tarefa } };

    if (action === 'concluida') {
      updatedTask.tarefa.status = 'Concluída';
    } else if (action === 'reagendar') {
      const newDate = prompt('Informe nova data (YYYY-MM-DD HH:mm):', task.start);
      if (!newDate) return;
      updatedTask.start = newDate;
      updatedTask.end = newDate;
      if (updatedTask.tarefa) updatedTask.tarefa.data = newDate;
    } else if (action === 'cancelar') {
      await handleDelete(task.id);
      return;
    }

    await handleSave(updatedTask, true);
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {/* Calendário */}
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
        {tasksToday.length === 0 && <p>Nenhuma tarefa hoje</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasksToday.map(task => (
            <li key={task.id} style={{ marginBottom: 8, border: '1px solid #ddd', padding: 5, borderRadius: 4 }}>
              <strong>{task.conteudoPrincipal}</strong>
              {task.tarefa && (
                <>
                  <div>Status: {task.tarefa.status}</div>
                  <div>
                    <button onClick={() => handleTaskAction(task, 'concluida')}>Concluída</button>{' '}
                    <button onClick={() => handleTaskAction(task, 'reagendar')}>Reagendar</button>{' '}
                    <button onClick={() => handleTaskAction(task, 'cancelar')}>Cancelar</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}