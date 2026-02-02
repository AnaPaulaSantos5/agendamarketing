'use client';

import React, { useState } from 'react';
import EventModal from './EventModal';
import TopProfiles from './TopProfiles';
import ClientCard from './ClientCard';
import CalendarGrid from './CalendarGrid';

const AgendaCalendar: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="agenda-container" style={{ display: 'flex', height: '100vh' }}>
      {/* Área esquerda: Cliente */}
      <div className="left-panel" style={{ width: '300px', padding: '20px', borderRight: '1px solid #ccc' }}>
        <ClientCard />
      </div>

      {/* Área central: Calendário */}
      <div className="calendar-panel" style={{ flex: 1, padding: '20px' }}>
        <TopProfiles />
        <CalendarGrid onEventClick={() => setModalOpen(true)} />
      </div>

      {/* Modal de evento */}
      <EventModal
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default AgendaCalendar;