'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { useSession } from 'next-auth/react';

/* =======================
   Tipos
======================= */

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

type PerfilConfig = Record<Perfil, { chatId: string }>;

const PERFIS: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

/* =======================
   Componente
======================= */

export default function AgendaCalendar({ isAdmin = false }: { isAdmin?: boolean }) {
  const { data: session } = useSession();

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState({ start: '', end: '' });

  /* 🔹 PERFIS CONTROLADOS PELO ADMIN */
  const [perfilConfig, setPerfilConfig] = useState<PerfilConfig>({
    Confi: { chatId: '' },
    Cecília: { chatId: '' },
    Luiza: { chatId: '' },
    Júlio: { chatId: '' },
  });

  /* =======================
     Carregar eventos
  ======================= */
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.error('Agenda não retornou array:', data);
          setEvents([]);
        }
      })
      .catch(console.error);
  }, []);

  /* =======================
     Salvar ChatIds (ADMIN)
  ======================= */
  const salvarChatIds = async () => {
    await fetch('/api/agenda', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfilConfig }),
    });
    alert('ChatIDs salvos');
  };

  /* =======================
     Salvar Evento
  ======================= */
  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    await fetch('/api/agenda', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    setEvents(prev =>
      isEdit
        ? prev.map(e => (e.id === ev.id ? ev : e))
        : [...prev, ev]
    );
  };

  const perfilColors: Record<Perfil, string> = {
    Confi: '#ffce0a',
    Cecília: '#f5886c',
    Luiza: '#1260c7',
    Júlio: '#00b894',
  };

  return (
    <div className="flex h-full">
      {/* =======================
         LATERAL ESQUERDA
      ======================= */}
      <aside className="w-64 p-4 border-r">
        <h3 className="font-bold mb-4">Perfis</h3>

        {isAdmin &&
          PERFIS.map(perfil => (
            <div key={perfil} className="mb-3">
              <label className="block text-sm font-medium">{perfil}</label>
              <input
                className="w-full border rounded px-2 py-1"
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
          <button
            onClick={salvarChatIds}
            className="mt-4 w-full bg-black text-white py-2 rounded"
          >
            Salvar ChatIDs
          </button>
        )}
      </aside>

      {/* =======================
         CALENDÁRIO
      ======================= */}
      <main className="flex-1 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          events={events.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal || '(Sem título)',
            start: ev.start,
            end: ev.end,
            backgroundColor: ev.perfil ? perfilColors[ev.perfil] : '#ccc',
          }))}
          select={info => {
            setSelectedEvent(null);
            setSelectedDate({ start: info.startStr, end: info.endStr });
            setModalOpen(true);
          }}
          eventClick={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (!ev) return;

            setSelectedEvent(ev);
            setSelectedDate({ start: ev.start, end: ev.end });
            setModalOpen(true);
          }}
        />
      </main>

      {/* =======================
         MODAL
      ======================= */}
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
