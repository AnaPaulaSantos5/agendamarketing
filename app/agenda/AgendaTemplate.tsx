import React from 'react';
import TopProfiles from './TopProfiles';
import ClientCard from './ClientCard';
import CalendarGrid from './CalendarGrid';
import EventModal from './EventModal';
import WhatsAppWidget from './WhatsAppWidget';
import SpotifyWidget from './SpotifyWidget';
import { Profile, Client } from '../types';

const profiles: Profile[] = [
  { name: 'Ana', role: 'Designer', photoUrl: '/ana.jpg' },
  { name: 'Carlos', role: 'Marketing', photoUrl: '/carlos.jpg' },
];

const clients: Client[] = [
  { name: 'Cliente 1', status: 'Ativo', tasks: ['Task 1', 'Task 2'] },
  { name: 'Cliente 2', status: 'Inativo', tasks: ['Task 1'] },
];

const AgendaTemplate: React.FC = () => {
  return (
    <div className="agenda-template p-4">
      <header className="agenda-header mb-4">
        <TopProfiles profiles={profiles} />
      </header>

      <div className="main-grid flex gap-4">
        <div className="client-panel w-1/4 p-4 border-r">
          {clients.map((c, idx) => (
            <ClientCard key={idx} client={c} />
          ))}
        </div>

        <div className="calendar-panel w-3/4 p-4">
          <CalendarGrid />
        </div>
      </div>

      <EventModal />
      <WhatsAppWidget />
      <SpotifyWidget />
    </div>
  );
};

export default AgendaTemplate;