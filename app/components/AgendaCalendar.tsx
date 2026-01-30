// app/components/AgendaCalendar.tsx
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

interface Tarefa {
  titulo: string;
  responsavel: string;
  responsavelChatId?: string;
  data: string;
  status?: string;
  linkDrive?: string;
  notificar?: string;
}

export interface AgendaEvent {
  id: string;
  start: string;
  end: string;
  tipoEvento: string;
  tipo: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: string;
  tarefa?: Tarefa | null;
}

const AgendaCalendar = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Carrega os eventos da planilha ao iniciar
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        // Garante que datas são strings
        const formatted = data.map((ev: AgendaEvent) => ({
          ...ev,
          start: typeof ev.start === 'string' ? ev.start : new Date(ev.start).toISOString(),
          end: typeof ev.end === 'string' ? ev.end : new Date(ev.end).toISOString(),
        }));
        setEvents(formatted);
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
      }
    };
    fetchEvents();
  }, []);

  // Salva ou edita evento
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
        const res = await fetch('/api/agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ev),
        });
        if (!res.ok) throw new Error('Erro ao salvar evento');
        setEvents(prev => [...prev, ev]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  // Deleta evento
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
      alert('Erro ao deletar evento');
    }
  };

  // Ao clicar em um evento
  const handleEventClick = (clickInfo: any) => {
    const ev = events.find(e => e.id === clickInfo.event.id);
    if (!ev) return;
    setSelectedEvent(ev);
    setModalOpen(true);
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
        editable={true}
        selectable={true}
      />

      {modalOpen && selectedEvent && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedEvent.start}
          end={selectedEvent.end}
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
};

export default AgendaCalendar;
