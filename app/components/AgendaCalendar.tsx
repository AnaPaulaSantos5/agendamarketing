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

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

type Props = { isAdmin?: boolean };

export default function AgendaCalendar({ isAdmin = false }: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || '';
  const userImage = session?.user?.image || '';

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showProfileInfo, setShowProfileInfo] = useState(false);
  const [perfilFilter, setPerfilFilter] = useState<Perfil | 'Todos'>('Todos');

  const [perfilMap, setPerfilMap] = useState<Record<Perfil, { chatId: string; image?: string }>>({
    Confi: { chatId: 'confi@email.com', image: '/images/confi.png' },
    Cecília: { chatId: 'cecilia@email.com', image: '/images/cecilia.png' },
    Luiza: { chatId: 'luiza@email.com', image: '/images/luiza.png' },
    Júlio: { chatId: 'julio@email.com', image: '/images/julio.png' },
  });

  const isUserAdmin = isAdmin || userEmail === 'ana.paulinhacarneirosantos@gmail.com';

  // Carrega eventos da planilha
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then((data: AgendaEvent[]) => setEvents(data))
      .catch(console.error);
  }, []);

  // Salva chatId de um perfil
  const savePerfil = async (perfil: Perfil) => {
    try {
      const chatId = perfilMap[perfil].chatId;
      const res = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfil, chatId }),
      });
      if (!res.ok) throw new Error('Erro ao salvar ChatID');
      alert('Responsável ChatID salvo!');

      // Atualiza localmente para persistir após reload
      setPerfilMap(prev => ({ ...prev, [perfil]: { ...prev[perfil], chatId } }));
    } catch (err) {
      console.error('Erro ao salvar ChatID:', err);
      alert('Erro ao salvar ChatID');
    }
  };

  // Salva ou atualiza evento
  const handleEventSave = async (ev: AgendaEvent, isEdit?: boolean) => {
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      await fetch('/api/agenda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
      });

      setEvents(prev => {
        if (isEdit) return prev.map(e => (e.id === ev.id ? ev : e));
        return [...prev, ev];
      });
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
    }
  };

  // Excluir evento
  const handleEventDelete = async (id: string) => {
    try {
      await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Erro ao deletar evento:', err);
    }
  };

  const perfilColors: Record<Perfil, string> = { Confi: '#ffce0a', Cecília: '#f5886c', Luiza: '#1260c7', Júlio: '#00b894' };

  // Eventos filtrados
  const filteredEvents = perfilFilter === 'Todos' ? events : events.filter(e => e.perfil === perfilFilter);

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Painel lateral */}
      <div style={{ flex: 0.3, textAlign: 'center' }}>
        <div style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => setShowProfileInfo(!showProfileInfo)}>
          <img src={userImage} alt={userName} style={{ width: 60, height: 60, borderRadius: '50%' }} />
        </div>

        {showProfileInfo && (
          <div style={{ marginTop: 8, textAlign: 'left', border: '1px solid #ccc', padding: 8, borderRadius: 4 }}>
            <p><strong>Nome:</strong> {userName}</p>
            <p><strong>E-mail:</strong> {userEmail}</p>

            {isUserAdmin && (
              <>
                <p><strong>Editar ChatIDs:</strong></p>
                {profiles.map(p => (
                  <div key={p} style={{ marginBottom: 6 }}>
                    <label>{p}: </label>
                    <input
                      value={perfilMap[p]?.chatId || ''}
                      onChange={e => setPerfilMap({ ...perfilMap, [p]: { ...perfilMap[p], chatId: e.target.value } })}
                      style={{ width: '70%' }}
                    />
                    <button onClick={() => savePerfil(p)}>Salvar</button>
                  </div>
                ))}
              </>
            )}

            <p><strong>Filtrar eventos:</strong></p>
            <select value={perfilFilter} onChange={e => setPerfilFilter(e.target.value as Perfil | 'Todos')}>
              <option value="Todos">Todos</option>
              {profiles.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Agenda */}
      <div style={{ flex: 3 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          editable
          allDaySlot={false}
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
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
          height="auto"
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          onSave={handleEventSave}
          onDelete={handleEventDelete} // ✅ envia função de exclusão
          userPerfil={userName as Perfil}
          userChatId={perfilMap[userName as Perfil]?.chatId || ''}
          userImage={userImage}
          isAdmin={isUserAdmin}
          perfilMap={perfilMap}
          setPerfilMap={setPerfilMap}
          profiles={profiles}
        />
      )}
    </div>
  );
}
