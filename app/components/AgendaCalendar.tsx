'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg, EventClickArg } from '@fullcalendar/interaction';
import EventModal from './EventModal';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    data: string;
    status: 'Pendente' | 'Concluída';
    linkDrive?: string;
    notificar?: string;
  };
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Buscar eventos da API
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error('Erro ao buscar eventos', err);
      }
    }
    fetchEvents();
  }, []);

  // Abrir modal com informações do evento
  const handleEventClick = (info: EventClickArg) => {
    const ev = events.find(e => e.id === info.event.id);
    if (!ev) return;
    setSelectedEvent(ev);
    setIsModalOpen(true);
  };

  // Salvar novo evento ou edição
  const handleSave = async (ev: AgendaEvent, isEdit: boolean) => {
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch('/api/agenda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
      });
      if (!res.ok) throw new Error('Erro ao salvar');

      if (isEdit) {
        setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
      } else {
        // Para novo evento, atribuir id temporário
        ev.id = String(events.length + 1);
        setEvents(prev => [...prev, ev]);
      }
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  // Excluir evento/tarefa
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este evento/tarefa?')) return;
    try {
      const res = await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erro ao excluir');
      setEvents(prev => prev.filter(e => e.id !== id));
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir evento');
    }
  };

  // Alterar status da tarefa (Concluída/Pendente)
  const toggleTaskStatus = async (ev: AgendaEvent) => {
    if (!ev.tarefa) return;
    const newStatus = ev.tarefa.status === 'Pendente' ? 'Concluída' : 'Pendente';
    const updated = { ...ev, tarefa: { ...ev.tarefa, status: newStatus } };
    await handleSave(updated, true);
  };

  // Reagendar tarefa/evento
  const rescheduleTask = async (ev: AgendaEvent) => {
    const newDate = prompt('Nova data/hora (YYYY-MM-DD HH:MM)', ev.start);
    if (!newDate) return;
    const updated = { ...ev, start: newDate, end: newDate };
    await handleSave(updated, true);
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  // Tarefas do dia para checklist
  const todayStr = new Date().toISOString().slice(0, 10);
  const tasksToday = events.filter(e => e.start.slice(0, 10) === todayStr && e.tarefa);

  return (
    <div style={{ display: 'flex' }}>
      {/* Calendário */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 8 }}>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
          }))}
          dateClick={info => {
            setSelectedEvent({
              id: '',
              start: info.dateStr,
              end: info.dateStr,
              conteudoPrincipal: '',
              perfil: filterProfile,
            });
            setIsModalOpen(true);
          }}
          eventClick={handleEventClick}
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ width: 280, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        {tasksToday.length === 0 && <p>Nenhuma tarefa hoje</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasksToday.map(e => (
            <li
              key={e.id}
              style={{
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid #eee',
                padding: '5px 8px',
                borderRadius: 4,
              }}
            >
              <div>
                <input
                  type="checkbox"
                  checked={e.tarefa?.status === 'Concluída'}
                  onChange={() => toggleTaskStatus(e)}
                />{' '}
                {e.conteudoPrincipal} ({e.tarefa?.titulo})
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => rescheduleTask(e)} title="Reagendar">
                  ⏰
                </button>
                <button onClick={() => e.id && handleDelete(e.id)} title="Cancelar">
                  ❌
                </button>
              </div>
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
          onSave={(ev: AgendaEvent) => handleSave(ev, Boolean(ev.id))}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}