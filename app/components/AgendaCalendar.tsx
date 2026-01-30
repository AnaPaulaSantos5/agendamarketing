// app/components/AgendaCalendar.tsx
'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
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

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Busca os eventos do Google Sheet
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data: AgendaEvent[] = await res.json();

      // Ajusta as datas para o calendário
      const formatted = data.map(ev => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
      }));

      setEvents(formatted);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Salvar ou editar evento
  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const body = { ...ev };

      await fetch('/api/agenda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (isEdit) {
        setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
      } else {
        setEvents(prev => [...prev, ev]);
      }
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      alert('Erro ao salvar evento');
    }
  };

  // Abrir modal ao clicar no evento
  const handleEventClick = (info: any) => {
    const ev = events.find(e => e.id === info.event.id);
    if (ev) {
      setSelectedEvent(ev);
      setModalOpen(true);
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events.map(ev => ({
          id: ev.id,
          title: ev.conteudoPrincipal,
          start: ev.start,
          end: ev.end,
        }))}
        eventClick={handleEventClick}
      />

      {modalOpen && selectedEvent && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedEvent.start}
          end={selectedEvent.end}
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
}
