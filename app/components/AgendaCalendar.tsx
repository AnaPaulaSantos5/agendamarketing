'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import EventModal, { AgendaEvent as ModalAgendaEvent } from './EventModal';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal: string; // obrigatório para compatibilidade com EventModal
  conteudoSecundario?: string;
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

  // Fetch inicial da agenda
  useEffect(() => {
    fetchAgenda();
  }, []);

  async function fetchAgenda() {
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(data || []);
    } catch (err) {
      console.error('Erro da API:', err);
    }
  }

  // Clique em data para criar novo evento
  const handleDateClick = (info: DateClickArg) => {
    setSelectedEvent({
      id: '',
      start: info.dateStr,
      end: info.dateStr,
      conteudoPrincipal: '',
      perfil: filterProfile,
    });
    setIsModalOpen(true);
  };

  // Clique em evento para ver informações
  const handleEventClick = (info: EventClickArg) => {
    const ev = events.find(e => e.id === info.event.id);
    if (!ev) return;
    setSelectedEvent(ev);
    setIsModalOpen(true);
  };

  // Salvar evento (novo ou edição)
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
        setEvents(prev =>
          prev.map(e => (e.id === ev.id ? { ...e, ...ev } : e))
        );
      } else {
        const newId = String(events.length + 1);
        setEvents(prev => [...prev, { ...ev, id: newId }]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  // Excluir evento
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este evento?')) return;
    try {
      const res = await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erro ao deletar');
      setEvents(prev => prev.filter(e => e.id !== id));
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar evento');
    }
  };

  // Checklist lateral
  const handleChecklistChange = async (
    ev: AgendaEvent,
    action: 'Concluída' | 'Reagendar' | 'Cancelar'
  ) => {
    let updatedEvent = { ...ev };
    if (action === 'Concluída') updatedEvent.tarefa!.status = 'Concluída';
    if (action === 'Cancelar') updatedEvent.tarefa!.status = 'Cancelada';
    if (action === 'Reagendar') {
      const newDate = prompt('Informe nova data (YYYY-MM-DD HH:mm)', ev.start);
      if (!newDate) return;
      updatedEvent.start = newDate;
      updatedEvent.end = newDate;
    }
    await handleSave(updatedEvent, true);
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  return (
    <div style={{ display: 'flex' }}>
      {/* Calendário */}
      <div style={{ flex: 1 }}>
        <div>
          Filtrar por perfil:{' '}
          <select
            value={filterProfile}
            onChange={e => setFilterProfile(e.target.value as Perfil)}
          >
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
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ width: 300, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        <ul>
          {events
            .filter(e => e.tarefa && e.start.slice(0, 10) === new Date().toISOString().slice(0, 10))
            .map(e => (
              <li key={e.id} style={{ marginBottom: 8 }}>
                <strong>{e.conteudoPrincipal}</strong> ({e.tarefa!.status})
                <div style={{ marginTop: 4 }}>
                  <button onClick={() => handleChecklistChange(e, 'Concluída')}>
                    Concluída
                  </button>{' '}
                  <button onClick={() => handleChecklistChange(e, 'Reagendar')}>
                    Reagendar
                  </button>{' '}
                  <button onClick={() => handleChecklistChange(e, 'Cancelar')}>
                    Cancelar
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
          event={selectedEvent as ModalAgendaEvent}
          onSave={(ev: ModalAgendaEvent) =>
            handleSave(ev as AgendaEvent, Boolean(selectedEvent.id))
          }
          onDelete={() => handleDelete(selectedEvent.id)}
        />
      )}
    </div>
  );
}