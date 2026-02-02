'use client'; // <- ESSENCIAL para usar useState e hooks

import React, { useState } from 'react';
import TopProfiles from '@/app/components/TopProfiles';
import ClientCard from '@/app/components/ClientCard';
import CalendarGrid from '@/app/components/CalendarGrid';
import EventModal from '@/app/components/EventModal';
import SpotifyPlayer from '@/app/components/SpotifyPlayer';
import WhatsAppNotifications from '@/app/components/WhatsAppNotifications';

export default function AgendaPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <TopProfiles />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col p-4 gap-4">
          <ClientCard />
        </div>
        <CalendarGrid />
        <div className="flex flex-col p-4 gap-4">
          <SpotifyPlayer />
        </div>
      </div>
      <EventModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <WhatsAppNotifications />
    </div>
  );
}