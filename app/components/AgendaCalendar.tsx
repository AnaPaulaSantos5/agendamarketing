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

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

type Props = { isAdmin?: boolean };

export default function AgendaCalendar({ isAdmin = false }: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image || '';

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil | 'Todos'>('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });
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
      .then(setEvents)
      .catch(console.error);
  }, []);

  // Função para salvar chatId de qualquer perfil
  const savePerfil = async (perfil: Perfil) => {
    try {
      const chatId = perfilMap[perfil]?.chatId;
      if (!chatId) return alert(`ChatID vazio para ${perfil}`);

      console.log('Enviando para API:', { perfil, chatId });
      const res = await fetch('/api/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfil, chatId }),
      });

      const data = await res.json();
      console.log('Resposta da API:', data);

      if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

      alert(`Responsável ChatID de ${perfil} salvo com sucesso!`);
    } catch (err: any) {
      console.error('Erro no savePerfil:', err);
      alert(`Erro ao salvar ChatID: ${err.message || err}`);
    }
  };

  const filteredEvents = events.filter(e => filterProfile === 'Todos' || e.perfil === filterProfile);

  const perfilColors: Record<Perfil, string> = { Confi: '#ffce0a', Cecília: '#f5886c', Luiza: '#1260c7', Júlio: '#00b894' };

  return (
    <div style={{ display: 'flex', gap: 24, backgroundColor: '#f0f4f8', padding: 12 }}>
      {/* Painel esquerdo */}
      <div style={{ flex: 0.3, textAlign: 'center', border: '1px solid #ccc', borderRadius: 8, padding: 8 }}>
        <h3>Perfis e ChatIDs</h3>
        {profiles.map(p => (
          <div key={p} style={{ marginBottom: 12 }}>
            <p><strong>{p}</strong></p>
            <input
              value={perfilMap[p]?.chatId || ''}
              onChange={e => setPerfilMap({ ...perfilMap, [p]: { ...perfilMap[p], chatId: e.target.value } })}
              disabled={!isUserAdmin}
            />
            {isUserAdmin && <button onClick={() => savePerfil(p)}>Salvar</button>}
          </div>
        ))}
      </div>

      {/* Agenda */}
      <div style={{ flex: 3 }}>
        <label style={{ marginBottom: 12, display: 'block' }}>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil | 'Todos')}>
            <option value="Todos">Todos</option>
            {profiles.map(p => (<option key={p} value={p}>{p}</option>))}
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
          select={info => { setSelectedEvent(null); setSelectedDate({ start: info.startStr, end: info.endStr }); setModalOpen(true); }}
          eventClick={info => { const ev = events.find(e => e.id === info.event.id); if (ev) { setSelectedEvent(ev); setSelectedDate({ start: ev.start, end: ev.end }); setModalOpen(true); } }}
          height="auto"
        />

        {/* Modal de eventos */}
        {modalOpen && selectedDate && (
          <EventModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            start={selectedDate.start}
            end={selectedDate.end}
            event={selectedEvent}
            onSave={() => {}}
            onDelete={() => {}}
            isAdmin={isUserAdmin}
            userPerfil={userEmail as Perfil} // apenas para preencher modal
            userChatId={''}
            userImage={userImage}
            perfilMap={perfilMap}
            setPerfilMap={setPerfilMap}
            profiles={profiles}
          />
        )}
      </div>
    </div>
  );
}