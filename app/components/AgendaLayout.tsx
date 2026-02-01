'use client';

import React, { useEffect, useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import RightSidebar from './RightSidebar';
import AgendaCalendar from './AgendaCalendar';
import EventModal from './EventModal';
import { Perfil, AgendaEvent } from './types';
import { getEvents, saveEvent, deleteEvent } from './services/agendaService';

interface AgendaLayoutProps {
  userName: string;
  userPerfil: Perfil;
  responsavelChatId: string;
}

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaLayout({
  userName,
  userPerfil,
  responsavelChatId,
}: AgendaLayoutProps) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selectedPerfil, setSelectedPerfil] = useState<Perfil>(userPerfil);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<AgendaEvent | null>(null);
  const [modalStart, setModalStart] = useState('');
  const [modalEnd, setModalEnd] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave(event: AgendaEvent, isEdit?: boolean) {
    try {
      await saveEvent(event, isEdit);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteEvent(id);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ProfileSidebar
        userName={userName}
        userPerfil={selectedPerfil}
        responsavelChatId={responsavelChatId}
        profiles={profiles}
        onProfileChange={setSelectedPerfil}
        onToggleProfilePanel={() => setShowProfilePanel(prev => !prev)}
      />

      <main style={{ flex: 1, padding: 16 }}>
        <AgendaCalendar
          events={events.filter(ev => !selectedPerfil || ev.perfil === selectedPerfil)}
          userPerfil={selectedPerfil}
        />
        <button
          style={{ marginTop: 16 }}
          onClick={() => {
            setModalStart(new Date().toISOString().slice(0, 16));
            setModalEnd(new Date().toISOString().slice(0, 16));
            setModalEvent(null);
            setModalOpen(true);
          }}
        >
          Novo Evento
        </button>
      </main>

      <RightSidebar />

      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={modalStart}
          end={modalEnd}
          event={modalEvent}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}