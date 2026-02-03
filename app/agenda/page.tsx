"use client";

import React, { useState } from "react";

// Components
import TopProfiles from "../components/TopProfiles";
import ClientCard from "../components/ClientCard";
import CalendarGrid from "../components/CalendarGrid";
import EventModal from "../components/EventModal";
import SpotifyWidget from "../components/SpotifyWidget";
import WhatsAppWidget from "../components/WhatsAppWidget";

// Definindo interface Profile mínima para TopProfiles
interface Profile {
  name: string;
  photoUrl?: string;
}

// Cliente de teste
const testClients = [
  {
    name: "Confi Seguros",
    status: "Ativo",
    tasks: ["Segurança Residencial", "Consórcio Imóvel"]
  },
  {
    name: "Luiza",
    status: "Ativo",
    tasks: ["Seguro Auto", "Vida Individual"]
  }
];

// Perfis de teste
const profiles: Profile[] = [
  { name: "Confi" },
  { name: "Luiza" },
  { name: "Júlio" },
  { name: "Cecília" }
];

export default function AgendaPage() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="agenda-container flex h-screen">
      {/* Lateral esquerda: cliente */}
      <div className="client-panel w-1/4 p-4 border-r">
        <h3>Clientes</h3>
        {testClients.map((client, idx) => (
          <ClientCard key={idx} client={client} />
        ))}
      </div>

      {/* Centro: calendário */}
      <div className="calendar-panel w-1/2 p-4">
        {/* Topo com perfis */}
        <header className="agenda-header mb-4">
          <TopProfiles profiles={profiles} />
        </header>

        {/* Calendário */}
        <CalendarGrid />

        {/* Modal de eventos */}
        {selectedEvent && (
          <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </div>

      {/* Lateral direita: widgets */}
      <div className="widgets-panel w-1/4 p-4 border-l flex flex-col gap-4">
        <SpotifyWidget />
        <WhatsAppWidget />
      </div>
    </div>
  );
}