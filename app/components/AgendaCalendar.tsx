'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';
type AgendaEvent = {
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
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  async function fetchEvents() {
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(data || []);
    } catch (err) {
      console.error('Erro ao carregar eventos', err);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = (info: any) => {
    setSelectedEvent({
      id: '',
      start: info.dateStr,
      end: info.dateStr,
      conteudoPrincipal: '',
      perfil: filterProfile,
    });
    setModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const ev = events.find(e => e.id === info.event.id);
    if (ev) {
      setSelectedEvent(ev);
      setModalOpen(true);
    }
  };

  const handleSave = async (event: AgendaEvent, isEdit: boolean) => {
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const url = '/api/agenda';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      setModalOpen(false);
      fetchEvents();
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
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error('Erro ao deletar evento', err);
      alert('Erro ao deletar evento');
    }
  };

  const handleTaskUpdate = async (eventId: string, tarefa: any) => {
    try {
      await fetch('/api/agenda', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, tarefa }),
      });
      fetchEvents();
    } catch (err) {
      console.error('Erro ao atualizar tarefa', err);
    }
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile || e.tipoEvento === 'Interno');

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
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
          selectable
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ width: 300, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        {events.filter(e => e.tarefa && e.tarefa.data?.slice(0, 10) === new Date().toISOString().slice(0, 10))
          .map(e => (
            <div key={e.id} style={{ borderBottom: '1px solid #ddd', padding: 5 }}>
              <strong>{e.tarefa!.titulo}</strong> ({e.tarefa!.status})
              <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
                {e.tarefa!.status !== 'Concluída' && (
                  <button onClick={() => handleTaskUpdate(e.id, { ...e.tarefa, status: 'Concluída' })}>✅ Concluir</button>
                )}
                <button onClick={() => {
                  const newDate = prompt('Nova data/hora (YYYY-MM-DD HH:MM)', e.tarefa!.data);
                  if (newDate) handleTaskUpdate(e.id, { ...e.tarefa, data: newDate });
                }}>✏️ Reagendar</button>
                <button onClick={() => {
                  if (confirm('Deseja excluir esta tarefa?')) handleTaskUpdate(e.id, { ...e.tarefa, status: 'Excluída' });
                }}>❌ Excluir</button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
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