'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';
import AgendaModal from './AgendaModal';

export type Perfil = 'Confi' | 'Luiza' | 'Cecília' | 'Júlio';

export type AgendaEvent = {
  id: string; // ⚠️ string (FullCalendar exige)
  title: string;
  start: string;
  end?: string;
  perfil?: Perfil;
  tarefa?: {
    responsavelChatId?: string;
    userImage?: string;
  };
};

type PerfilConfig = {
  chatId: string;
  image: string;
};

export default function AgendaCalendar({ isAdmin }: { isAdmin: boolean }) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [perfilMap, setPerfilMap] = useState<Record<Perfil, PerfilConfig>>({} as any);

  // 🔹 Carregar eventos
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data =>
        setEvents(
          data.map((e: any) => ({
            ...e,
            id: String(e.id), // 🔥 garante compatibilidade
          }))
        )
      );
  }, []);

  // 🔹 Carregar perfis
  useEffect(() => {
    fetch('/api/perfil')
      .then(res => res.json())
      .then(data => {
        const map: any = {};
        data.forEach((p: any) => {
          map[p.perfil] = { chatId: p.chatId, image: p.image };
        });
        setPerfilMap(map);
      });
  }, []);

  function getPerfilConfig(perfil?: Perfil): PerfilConfig {
    return perfil && perfilMap[perfil]
      ? perfilMap[perfil]
      : { chatId: '', image: '' };
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        selectable
        eventClick={info => {
          const ev = events.find(e => e.id === info.event.id);
          if (ev) setSelectedEvent(ev);
        }}
      />

      {selectedEvent && (
        <AgendaModal
          event={selectedEvent}
          perfilConfig={getPerfilConfig(selectedEvent.perfil)}
          perfilMap={perfilMap}
          isAdmin={isAdmin}
          onClose={() => setSelectedEvent(null)}
          onSaved={() => {
            setSelectedEvent(null);
            fetch('/api/agenda')
              .then(res => res.json())
              .then(data =>
                setEvents(data.map((e: any) => ({ ...e, id: String(e.id) })))
              );
          }}
        />
      )}
    </>
  );
}
