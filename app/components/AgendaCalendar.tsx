'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { useSession } from 'next-auth/react';

export interface AgendaEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  perfil?: string;
  tipoEvento?: string;
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
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <strong>Responsável Chat ID:</strong>{' '}
        {session?.user?.responsavelChatId || '—'}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={(info) => {
          const ev = events.find(
            e => String(e.id) === String(info.event.id)
          );
          if (!ev) return;
          setSelectedEvent(ev);
          setModalOpen(true);
        }}
      />

      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        isAdmin={isAdmin}
        userChatId={session?.user?.responsavelChatId || ''}
        userPerfil={session?.user?.perfil || ''}
        userImage={session?.user?.image || ''}
        onSaved={() => {
          fetch('/api/agenda')
            .then(res => res.json())
            .then(data => setEvents(data));
        }}
      />
    </>
  );
}
