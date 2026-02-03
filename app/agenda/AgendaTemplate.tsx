// app/agenda/AgendaTemplate.tsx
"use client";

import React, { useState } from "react";

// Tipos
interface Profile {
  id: number;
  name: string;
  photoUrl: string;
}

interface Client {
  id: number;
  name: string;
  status: string;
  tasks: string[];
}

interface Event {
  id: number;
  title: string;
  date: string;
  description?: string;
}

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

// Componentes

const TopProfiles: React.FC<{ profiles: Profile[] }> = ({ profiles }) => {
  return (
    <div className="flex gap-4">
      {profiles.map((p) => (
        <div key={p.id} className="text-center">
          <img src={p.photoUrl} alt={p.name} className="w-12 h-12 rounded-full" />
          <div>{p.name}</div>
        </div>
      ))}
    </div>
  );
};

const ClientCard: React.FC<{ client: Client }> = ({ client }) => {
  return (
    <div className="border p-2 rounded mb-2">
      <strong>{client.name}</strong> - {client.status}
      <ul className="text-sm list-disc ml-4">
        {client.tasks.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
};

const CalendarGrid: React.FC<{ events: Event[]; onSelect: (e: Event) => void }> = ({ events, onSelect }) => {
  return (
    <div className="grid grid-cols-7 gap-2">
      {events.map((e) => (
        <div
          key={e.id}
          className="border p-2 rounded cursor-pointer hover:bg-gray-100"
          onClick={() => onSelect(e)}
        >
          {e.date}: {e.title}
        </div>
      ))}
    </div>
  );
};

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded w-80">
        <h2 className="text-lg font-bold">{event.title}</h2>
        <p>{event.date}</p>
        {event.description && <p>{event.description}</p>}
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

const WhatsAppWidget: React.FC = () => {
  return (
    <div className="fixed bottom-4 right-4 p-3 bg-green-500 text-white rounded-full cursor-pointer">
      WhatsApp
    </div>
  );
};

const SpotifyWidget: React.FC = () => {
  return (
    <div className="fixed bottom-20 right-4 p-3 bg-black text-white rounded-full cursor-pointer">
      Spotify
    </div>
  );
};

// Dados de exemplo
const testProfiles: Profile[] = [
  { id: 1, name: "Ana", photoUrl: "/profile1.jpg" },
  { id: 2, name: "Carlos", photoUrl: "/profile2.jpg" },
];

const testClients: Client[] = [
  { id: 1, name: "Cliente 1", status: "Ativo", tasks: ["Tarefa A", "Tarefa B"] },
  { id: 2, name: "Cliente 2", status: "Inativo", tasks: ["Tarefa X"] },
];

const testEvents: Event[] = [
  { id: 1, title: "Reunião", date: "2026-02-03" },
  { id: 2, title: "Call", date: "2026-02-04" },
];

// Componente principal
const AgendaTemplate: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  return (
    <div className="p-4">
      {/* Topo com perfis */}
      <header className="agenda-header mb-4">
        <TopProfiles profiles={testProfiles} />
      </header>

      <div className="flex gap-4">
        {/* Lateral esquerda: clientes */}
        <div className="w-1/4 p-2 border-r">
          <h3 className="font-bold mb-2">Clientes</h3>
          {testClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>

        {/* Centro: calendário */}
        <div className="flex-1 p-2">
          <h3 className="font-bold mb-2">Calendário</h3>
          <CalendarGrid events={testEvents} onSelect={setSelectedEvent} />
        </div>
      </div>

      {/* Modal de evento */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {/* Widgets */}
      <WhatsAppWidget />
      <SpotifyWidget />
    </div>
  );
};

export default AgendaTemplate;