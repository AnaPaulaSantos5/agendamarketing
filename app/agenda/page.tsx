'use client';

import React, { useState } from 'react';
import TopProfiles from '@/app/components/TopProfiles';
import ClientCard from '@/app/components/ClientCard';
import CalendarGrid from '@/app/components/CalendarGrid';
import EventModal from '@/app/components/EventModal';
import Checklist from '@/app/components/Checklist';
import SpotifyWidget from '@/app/components/SpotifyWidget';
import WhatsAppNotifications from '@/app/components/WhatsAppNotifications';

export default function AgendaPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f5f5f5' }}>
      
      {/* Lateral Esquerda */}
      <div style={{ width: 300, padding: 16, borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ClientCard />
        <Checklist />
      </div>

      {/* Calendário Central */}
      <div style={{ flex: 1, padding: 16, position: 'relative' }}>
        <TopProfiles />
        <CalendarGrid onEventClick={() => setModalOpen(true)} />
      </div>

      {/* Lateral Direita */}
      <div style={{ width: 300, padding: 16, borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SpotifyWidget />
        <WhatsAppNotifications />
      </div>

      {/* Modal de evento */}
      <EventModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}