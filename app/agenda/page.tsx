"use client"; // necessário para usar useState, useEffect

import React, { useState } from 'react';
import TopProfiles from '@/app/components/TopProfiles';
import ClientCard from '@/app/components/ClientCard';
import CalendarGrid from '@/app/components/CalendarGrid';
import EventModal from '@/app/components/EventModal';
import WhatsAppNotifications from '@/app/components/WhatsAppNotifications';

export default function AgendaPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="agenda-page flex">
      {/* Lateral esquerda: cliente */}
      <div className="client-panel w-1/4 p-4 border-r">
        <ClientCard />
      </div>

      {/* Centro: calendário */}
      <div className="calendar-panel flex-1 p-4">
        <TopProfiles />
        <CalendarGrid onEventClick={() => setModalOpen(true)} />
      </div>

      {/* Lateral direita: notificações */}
      <div className="notifications-panel w-1/4 p-4 border-l">
        <WhatsAppNotifications />
        {/* SpotifyPlaceholder */}
        <div className="spotify-placeholder mt-4 p-2 border rounded">
          Spotify Widget Aqui
        </div>
      </div>

      {/* Modal de evento */}
      <EventModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}