// AgendaLayout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import RightSidebar from './RightSidebar';
import AgendaCalendar from './AgendaCalendar';
import EventModal from './EventModal';
import { Perfil, AgendaEvent } from './types';

interface AgendaLayoutProps {
  userName: string;
  userPerfil: Perfil;
  responsavelChatId: string;
}

const perfis: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaLayout({
  userName,
  userPerfil,
  responsavelChatId,
}: AgendaLayoutProps) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selectedPerfil, setSelectedPerfil] = useState<Perfil>(userPerfil);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // 🔹 Carrega eventos do Google Sheets
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data: AgendaEvent[] = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 🔹 Salvar ou atualizar evento
  const handleSave = async (ev: AgendaEvent, isEdit?: boolean) => {
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      await fetch('/api/agenda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
      });

      setEvents(prev =>
        isEdit ? prev.map(e => (e.id === ev.id ? ev : e)) : [...prev, ev]
      );
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
    }
  };

  // 🔹 Deletar evento
  const handleDelete = async (id: string) => {
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

  // 🔹 Abrir modal para novo evento
  const handleSelect = (start: string, end: string) => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  // 🔹 Abrir modal ao clicar no evento existente
  const handleEventClick = (ev: AgendaEvent) => {
    setSelectedEvent(ev);
    setModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ProfileSidebar
        userName={userName}
        userPerfil={selectedPerfil}
        responsavelChatId={responsavelChatId}
        profiles={perfis}
        onProfileChange={setSelectedPerfil}
        onToggleProfilePanel={() => {}}
      />

      <main style={{ flex: 1, padding: 16 }}>
        <AgendaCalendar
          events={events.filter(e => e.perfil === selectedPerfil)}
          userPerfil={selectedPerfil}
          onDateSelect={handleSelect}
          onEventClick={handleEventClick}
        />
      </main>

      <RightSidebar />

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        start={selectedEvent?.start || new Date().toISOString().slice(0, 16)}
        end={selectedEvent?.end || new Date().toISOString().slice(0, 16)}
        event={selectedEvent}
      />
    </div>
  );
}