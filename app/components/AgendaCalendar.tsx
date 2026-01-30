// app/components/AgendaCalendar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar, { EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

export interface Tarefa {
  titulo: string;
  responsavel: string;
  responsavelChatId?: string;
  data: string;
  status: string;
  linkDrive?: string;
  notificar?: string;
}

export interface AgendaEvent {
  id: string;
  start: string | Date;
  end: string | Date;
  tipoEvento: string;
  tipo: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: string;
  tarefa?: Tarefa | null;
}

const AgendaCalendar: React.FC = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Carregar eventos da planilha
  const loadEvents = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data: AgendaEvent[] = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
  };

  useEffect(() => {
    loadEvents();
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
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  // Abrir modal com evento selecionado
  const handleEventClick = (clickInfo: any) => {
    const ev = events.find(e => e.id === clickInfo.event.id);
    if (ev) {
      setSelectedEvent(ev);
      setModalOpen(true);
    }
  };

  // Conversão para FullCalendar
  const calendarEvents: EventInput[] = events.map(e => ({
    id: e.id,
    title: e.conteudoPrincipal,
    start: e.start instanceof Date ? e.start.toISOString() : e.start,
    end: e.end instanceof Date ? e.end.toISOString() : e.end,
  }));

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        eventClick={handleEventClick}
      />

      {modalOpen && selectedEvent && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={
            selectedEvent.start instanceof Date
              ? selectedEvent.start.toISOString()
              : selectedEvent.start
          }
          end={
            selectedEvent.end instanceof Date
              ? selectedEvent.end.toISOString()
              : selectedEvent.end
          }
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={async (id: string) => {
            await fetch('/api/agenda', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            });
            setEvents(prev => prev.filter(e => e.id !== id));
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AgendaCalendar;
