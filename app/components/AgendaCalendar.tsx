'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { useSession } from 'next-auth/react';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    responsavelChatId?: string;
    data: string;
    status: string;
    linkDrive?: string;
    notificar?: string;
  } | null;
};

const PERFIS: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar({ isAdmin = false }) {
  const { data: session } = useSession();

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState({ start: '', end: '' });

  // 🔹 PERFIS CONTROLADOS PELO ADMIN
  const [perfilConfig, setPerfilConfig] = useState<
    Record<Perfil, { chatId: string }>
  >({
    Confi: { chatId: '' },
    Cecília: { chatId: '' },
    Luiza: { chatId: '' },
    Júlio: { chatId: '' },
  });

  // 🔹 Carrega eventos
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  // 🔹 Salvar chatIds (ADMIN)
  const salvarChatIds = async () => {
    await fetch('/api/agenda', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfilConfig }),
    });
    alert('ChatIDs salvos');
  };

  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    await fetch('/api/agenda', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    setEvents(prev =>
      isEdit ? prev.map(e => (e.id === ev.id ? ev : e)) : [...prev, ev]
    );
  };

  const perfilColors: Record<Perfil, string> = {
    Confi: '#ffce0a',
    Cecília: '#f5886c',
    Luiza: '#1260c7',
    Júlio: '#00b894',
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* 🔹 LATERAL ESQUERDA */}
      <div style={{ width: 260 }}>
        <h3>Perfis</h3>

        {isAdmin &&
          PERFIS.map(perfil => (
            <div key={perfil} style={{ marginBottom: 8 }}>
              <strong>{perfil}</strong>
              <input
                placeholder="ChatId"
                value={perfilConfig[perfil].chatId}
                onChange={e =>
                  setPerfilConfig(prev => ({
                    ...prev,
                    [perfil]: { chatId: e.target.value },
                  }))
                }
              />
            </div>
          ))}

        {isAdmin && (
          <button onClick={salvarChatIds}>Salvar ChatIDs</button>
        )}
      </div>

      {/* 🔹 CALENDÁRIO */}
      <div style={{ flex: 1 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          events={events.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
            backgroundColor: ev.perfil
              ? perfilColors[ev.perfil]
              : '#ccc',
          }))}
          select={info => {
            setSelectedEvent(null);
            setSelectedDate({ start: info.startStr, end: info.endStr });
            setModalOpen(true);
          }}
          eventClick={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (ev) {
              setSelectedEvent(ev);
              setSelectedDate({ start: ev.start, end: ev.end });
              setModalOpen(true);
            }
          }}
        />
      </div>

      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={() => {}}
          perfilConfig={perfilConfig}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
