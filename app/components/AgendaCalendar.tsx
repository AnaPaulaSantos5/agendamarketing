'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { useSession } from 'next-auth/react';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio' | 'Ana Paula Dos Santos';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    responsavelChatId?: string;
    userImage?: string;
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

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio', 'Ana Paula Dos Santos'];

// Mapeamento perfil → chatId + imagem
const perfilMap: Record<Perfil, { chatId: string; image?: string }> = {
  Confi: { chatId: 'confi@email.com', image: '/images/confi.png' },
  Cecília: { chatId: 'cecilia@email.com', image: '/images/cecilia.png' },
  Luiza: { chatId: 'luiza@email.com', image: '/images/luiza.png' },
  Júlio: { chatId: 'julio@email.com', image: '/images/julio.png' },
  'Ana Paula Dos Santos': { chatId: 'ana.paulinhacarneirosantos@gmail.com', image: '/images/ana.png' },
};

type Props = { isAdmin?: boolean };

export default function AgendaCalendar({ isAdmin = false }: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || 'Ana Paula Dos Santos';
  const userImage = session?.user?.image || perfilMap[userName as Perfil]?.image || '';

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil | 'Todos'>('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [responsavelChatId, setResponsavelChatId] = useState(perfilMap[userName as Perfil]?.chatId || '');

  const today = new Date().toISOString().slice(0, 10);

  // Carregar agenda
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  // Carregar checklist
  useEffect(() => {
    fetch('/api/checklist')
      .then(res => res.json())
      .then((data: ChecklistItem[]) => {
        const todayTasks = data.filter(item => item.date?.slice(0, 10) === today && !item.done);
        setChecklist(todayTasks);
      })
      .catch(console.error);
  }, [today]);

  // Salvar alteração de Chat ID do perfil do usuário
  const saveChatId = async (newChatId: string) => {
    setResponsavelChatId(newChatId);
    await fetch('/api/perfil', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName, chatId: newChatId }),
    });
  };

  // Salvar evento
  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    const method = isEdit ? 'PATCH' : 'POST';
    await fetch('/api/agenda', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });
    if (isEdit) setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
    else setEvents(prev => [...prev, ev]);
  };

  // Excluir evento
  const deleteEvent = async (id: string) => {
    await fetch('/api/agenda', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setEvents(prev => prev.filter(e => e.id !== id));
    setChecklist(prev => prev.filter(c => c.id !== id));
    setModalOpen(false);
  };

  // Marcar tarefa como concluída
  const toggleChecklistItem = async (item: ChecklistItem) => {
    await fetch('/api/checklist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id }),
    });
    setChecklist(prev => prev.filter(c => c.id !== item.id));
  };

  const filteredEvents = events.filter(e => filterProfile === 'Todos' || e.perfil === filterProfile);

  const perfilColors: Record<Perfil, string> = {
    Confi: '#ffce0a',
    Cecília: '#f5886c',
    Luiza: '#1260c7',
    Júlio: '#00b894',
    'Ana Paula Dos Santos': '#8e44ad',
  };

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Painel do usuário */}
      <div style={{ flex: 0.3, textAlign: 'center' }}>
        <div style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => setShowProfileInfo(!showProfileInfo)}>
          <img src={userImage} alt={userName} style={{ width: 60, height: 60, borderRadius: '50%' }} />
        </div>
        {showProfileInfo && (
          <div style={{ marginTop: 8, textAlign: 'left', border: '1px solid #ccc', padding: 8, borderRadius: 4 }}>
            <p><strong>Nome:</strong> {userName}</p>
            <p><strong>E-mail:</strong> {userEmail}</p>
            <p>
              <strong>Responsável Chat ID:</strong>
              <input
                style={{ width: '100%' }}
                value={responsavelChatId}
                onChange={e => setResponsavelChatId(e.target.value)}
                onBlur={() => saveChatId(responsavelChatId)}
              />
            </p>
          </div>
        )}
      </div>

      {/* Agenda */}
      <div style={{ flex: 3 }}>
        <label style={{ marginBottom: 12, display: 'block' }}>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil | 'Todos')}>
            <option value="Todos">Todos</option>
            {profiles.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          editable
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
            backgroundColor: ev.perfil ? perfilColors[ev.perfil] : '#999',
            borderColor: '#000',
            textColor: '#000',
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
            if (ev) saveEvent({ ...ev, start: info.event.startStr, end: info.event.endStr }, true);
          }}
          eventResize={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (ev) saveEvent({ ...ev, start: info.event.startStr, end: info.event.endStr }, true);
          }}
          height="auto"
        />
      </div>

      {/* Checklist */}
      <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: 16 }}>
        <h3>Checklist Hoje</h3>
        {checklist.length === 0 && <p>Sem tarefas para hoje ✅</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {checklist.map(item => (
            <li key={item.id} style={{ marginBottom: 6 }}>
              {item.task} ({item.client})
              <button
                style={{
                  marginLeft: 8,
                  background: '#1260c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
                onClick={() => toggleChecklistItem(item)}
              >
                ✅
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
          isAdmin={isAdmin}
          userPerfil={userName as Perfil}
          userChatId={responsavelChatId}
          userImage={userImage}
        />
      )}
    </div>
  );
}