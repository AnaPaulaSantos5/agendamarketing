'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { useSession } from 'next-auth/react';
import EventModal from './EventModal';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
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

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const { data: session } = useSession();
  const userName = session?.user?.name || '';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image || '';

  const isAdmin = userEmail === 'ana.paulinhacarneirosantos@gmail.com';

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfilMap, setPerfilMap] = useState<Record<
    Perfil,
    { chatId: string; image?: string }
  >>({} as any);

  const [selectedPerfil, setSelectedPerfil] = useState<Perfil | 'Todos'>(
    'Todos'
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  /* 🔹 Carrega eventos */
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  /* 🔹 Carrega perfis da planilha */
  useEffect(() => {
    fetch('/api/perfil')
      .then(res => res.json())
      .then(setPerfilMap)
      .catch(console.error);
  }, []);

  /* 🔹 Salva ChatId */
  const savePerfil = async (perfil: Perfil) => {
    try {
      const res = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perfil,
          chatId: perfilMap[perfil]?.chatId || '',
        }),
      });

      if (!res.ok) throw new Error();
      alert('ChatId salvo com sucesso');
    } catch {
      alert('Erro ao salvar ChatId');
    }
  };

  /* 🔹 Salva evento local (API já cuida do Sheets) */
  const handleEventSave = (ev: AgendaEvent, isEdit?: boolean) => {
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

  const filteredEvents =
    selectedPerfil === 'Todos'
      ? events
      : events.filter(e => e.perfil === selectedPerfil);

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* 🔹 Painel lateral */}
      <aside style={{ width: 260 }}>
        <img
          src={userImage}
          alt={userName}
          style={{ width: 60, borderRadius: '50%' }}
        />
        <p>{userName}</p>

        <hr />

        <label>Filtrar por perfil</label>
        <select
          value={selectedPerfil}
          onChange={e => setSelectedPerfil(e.target.value as any)}
        >
          <option value="Todos">Todos</option>
          {profiles.map(p => (
            <option key={p}>{p}</option>
          ))}
        </select>

        {isAdmin && (
          <>
            <hr />
            <strong>ChatIds</strong>
            {profiles.map(p => (
              <div key={p} style={{ marginTop: 8 }}>
                <label>{p}</label>
                <input
                  value={perfilMap[p]?.chatId || ''}
                  onChange={e =>
                    setPerfilMap(prev => ({
                      ...prev,
                      [p]: { ...prev[p], chatId: e.target.value },
                    }))
                  }
                />
                <button onClick={() => savePerfil(p)}>Salvar</button>
              </div>
            ))}
          </>
        )}
      </aside>

      {/* 🔹 Calendário em grade/blocos */}
      <main style={{ flex: 1 }}>
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            multiMonthPlugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right:
              'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay',
          }}
          selectable
          editable
          height="auto"
          events={filteredEvents.map(ev => ({
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
            setSelectedDate({
              start: info.startStr,
              end: info.endStr,
            });
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
      </main>

      {/* 🔹 Modal */}
      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          onSave={handleEventSave}
          userPerfil={userName as Perfil}
          userChatId={perfilMap[userName as Perfil]?.chatId || ''}
          userImage={userImage}
          isAdmin={isAdmin}
          perfilMap={perfilMap}
          setPerfilMap={setPerfilMap}
          profiles={profiles}
        />
      )}
    </div>
  );
}
