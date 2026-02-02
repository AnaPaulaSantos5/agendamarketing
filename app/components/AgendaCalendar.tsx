'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import EventModal from './EventModal';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type Tarefa = {
  titulo: string;
  responsavel: Perfil;
  responsavelChatId?: string;
  data: string;
  status: string;
  linkDrive?: string;
  notificar?: string;
};

export type AgendaEvent = {
  id: string;
  start: string;
  end?: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  tarefa?: Tarefa | null;
};

type AgendaCalendarProps = {
  events: AgendaEvent[];
  perfis: Record<Perfil, { chatId: string }>;
  onRefresh: () => void;
  isAdmin?: boolean;
};

export default function AgendaCalendar({
  events,
  perfis,
  onRefresh,
  isAdmin = false,
}: AgendaCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState({ start: '', end: '' });

  const perfilColors: Record<Perfil, string> = {
    Confi: '#ffce0a',
    Cecília: '#f5886c',
    Luiza: '#1260c7',
    Júlio: '#00b894',
  };

  const handleSelect = (info: any) => {
    setSelectedEvent(null);
    setSelectedDate({ start: info.startStr, end: info.endStr });
    setModalOpen(true);
  };

  const handleEventClick = (info: any) => {
    const ev = events.find((e) => e.id === info.event.id);
    if (ev) {
      setSelectedEvent(ev);
      setSelectedDate({ start: ev.start, end: ev.end || '' });
      setModalOpen(true);
    }
  };

  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    try {
      await fetch('/api/agenda', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
      });
      onRefresh();
      setModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      onRefresh();
      setModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir evento');
    }
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        select={handleSelect}
        eventClick={handleEventClick}
        events={events.map((ev) => ({
          id: ev.id,
          title: ev.conteudoPrincipal,
          start: ev.start,
          end: ev.end,
          backgroundColor: ev.perfil ? perfilColors[ev.perfil] : '#ccc',
        }))}
        height="auto"
      />

      {modalOpen && (
        <EventModal
          isAdmin={isAdmin}
          event={selectedEvent}
          date={selectedDate.start}
          perfis={Object.keys(perfis).map((nome) => ({
            nome: nome as Perfil,
            chatId: perfis[nome as Perfil].chatId,
          }))}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
