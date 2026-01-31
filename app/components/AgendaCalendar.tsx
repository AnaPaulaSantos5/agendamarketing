'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useSession, signIn } from 'next-auth/react';
import EventModal from './EventModal';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;

  tipoEvento?: string;
  tipo?: string;

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

  allDay?: boolean;
};

export type ChecklistItem = {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const { data: session, status } = useSession();

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const today = new Date().toISOString().slice(0, 10);

  // 🔐 BLOQUEIO DE ACESSO
  if (status === 'loading') {
    return <p>Carregando agenda...</p>;
  }

  if (!session) {
    return (
      <div style={{ padding: 32 }}>
        <h2>Acesso restrito</h2>
        <p>Entre com sua conta Google para acessar a agenda.</p>
        <button onClick={() => signIn('google')}>
          Entrar com Google
        </button>
      </div>
    );
  }

  const userPerfil = session.user.perfil as Perfil;
  const userRole = session.user.role as 'admin' | 'user';

  // 🔁 PERFIL AUTOMÁTICO
  useEffect(() => {
    if (userPerfil) {
      setFilterProfile(userPerfil);
    }
  }, [userPerfil]);

  // 📥 CARREGAR EVENTOS
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  // 📋 CHECKLIST DO DIA
  useEffect(() => {
    fetch('/api/checklist')
      .then(res => res.json())
      .then((data: ChecklistItem[]) => {
        const todayTasks = data.filter(
          item => item.date?.slice(0, 10) === today && !item.done
        );
        setChecklist(todayTasks);
      })
      .catch(console.error);
  }, [today]);

  // 💾 SALVAR EVENTO
  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    const method = isEdit ? 'PATCH' : 'POST';

    await fetch('/api/agenda', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    if (isEdit) {
      setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
    } else {
      setEvents(prev => [...prev, ev]);
    }
  };

  // ❌ EXCLUIR EVENTO
  const deleteEvent = async (id: string) => {
    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setEvents(prev => prev.filter(e => e.id !== id));
    setChecklist(prev => prev.filter(c => c.id !== id));
    setModalOpen(false);
  };

  // ✅ CONCLUIR CHECKLIST
  const toggleChecklistItem = async (item: ChecklistItem) => {
    setChecklist(prev => prev.filter(c => c.id !== item.id));

    await fetch('/api/checklist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
  };

  // 👁️ FILTRO DE VISUALIZAÇÃO
  const filteredEvents = events.filter(ev => {
    if (userRole === 'admin') {
      return ev.perfil === filterProfile;
    }

    return ev.perfil === userPerfil || ev.perfil === 'Confi';
  });

  return (
    <>
      {/* 🔽 FILTRO (SÓ ADMIN) */}
      {userRole === 'admin' && (
        <label>
          Filtrar por perfil:{' '}
          <select
            value={filterProfile}
            onChange={e => setFilterProfile(e.target.value as Perfil)}
          >
            {profiles.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable={userRole === 'admin'}
        events={filteredEvents.map(ev => ({
          id: ev.id,
          title: ev.conteudoPrincipal,
          start: ev.start,
          end: ev.end,
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
        eventDrop={info => {
          const ev = events.find(e => e.id === info.event.id);
          if (ev) {
            saveEvent(
              { ...ev, start: info.event.startStr, end: info.event.endStr },
              true
            );
          }
        }}
        eventResize={info => {
          const ev = events.find(e => e.id === info.event.id);
          if (ev) {
            saveEvent(
              { ...ev, start: info.event.startStr, end: info.event.endStr },
              true
            );
          }
        }}
      />

      <h3>Checklist Hoje</h3>
      {checklist.length === 0 && <p>Sem tarefas para hoje ✅</p>}
      <ul>
        {checklist.map(item => (
          <li key={item.id}>
            {item.task} ({item.client})
            <button onClick={() => toggleChecklistItem(item)}>✅</button>
          </li>
        ))}
      </ul>

      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </>
  );
}