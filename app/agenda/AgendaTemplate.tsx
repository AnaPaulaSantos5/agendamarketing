import React from 'react';
import TopProfiles from '../components/TopProfiles'
import ClientCard from '../components/ClientCard'
import CalendarGrid from '../components/CalendarGrid'
import EventModal from '../components/EventModal'
import WhatsAppWidget from '../components/WhatsAppWidget'
import SpotifyWidget from '../components/SpotifyWidget'
import { Profile, Client } from '../components/types'

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