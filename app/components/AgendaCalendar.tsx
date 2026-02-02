'use client';

import { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { useSession } from 'next-auth/react';

export interface AgendaEvent {
  id?: string;
  title: string;
  start: string;
  end: string;
  perfil: string;
  tipoEvento: 'Interno' | 'Perfil';
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  tarefa?: {
    titulo?: string;
    responsavelChatId?: string;
    linkDrive?: string;
    userImage?: string;
  };
}

export default function AgendaCalendar() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfilFiltro, setPerfilFiltro] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  async function loadEvents() {
    const res = await fetch('/api/agenda');
    const data = await res.json();
    setEvents(data);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (perfilFiltro === 'todos') return events;
    return events.filter(e => e.perfil === perfilFiltro);
  }, [events, perfilFiltro]);

  function handleDateClick(arg: DateClickArg) {
    setSelectedEvent({
      title: '',
      start: arg.dateStr,
      end: arg.dateStr,
      perfil: session?.user?.perfil || '',
      tipoEvento: 'Perfil'
    });
    setModalOpen(true);
  }

  return (
    <>
      {/* 🔽 FILTRO DE PERFIL */}
      <div style={{ marginBottom: 12 }}>
        <select
          value={perfilFiltro}
          onChange={e => setPerfilFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="Confi Seguros">Confi Seguros</option>
          <option value="Confi Finanças">Confi Finanças</option>
          <option value="Confi Benefícios">Confi Benefícios</option>
        </select>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents.map(e => ({
          id: e.id,
          title: `${e.perfil} — ${e.conteudoPrincipal || e.title}`,
          start: e.start,
          end: e.end
        }))}
        dateClick={handleDateClick}
        eventClick={(info) => {
          const ev = events.find(e => e.id === info.event.id);
          if (!ev) return;
          setSelectedEvent(ev);
          setModalOpen(true);
        }}
      />

      <EventModal
        isOpen={modalOpen}
        event={selectedEvent}
        isAdmin={isAdmin}
        onClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
        }}
        onSaved={loadEvents}
      />
    </>
  );
}
