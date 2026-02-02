"use client";
import React, { useState } from "react";
import TopProfiles from "../components/TopProfiles";
import ClientCard from "../components/ClientCard";
import CalendarGrid from "../components/CalendarGrid";
import EventModal from "../components/EventModal";
import SpotifyWidget from "../components/SpotifyWidget";
import WhatsAppNotifications from "../components/WhatsAppNotifications";

const AgendaTemplate: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  // Perfis de exemplo
  const profiles = [
    { name: "Confi", photoUrl: "/avatars/confi.png" },
    { name: "Luiza", photoUrl: "/avatars/luiza.png" },
    { name: "Júlio", photoUrl: "/avatars/julio.png" },
    { name: "Cecília", photoUrl: "/avatars/cecilia.png" }
  ];

  // Cliente de exemplo
  const client = {
    name: "Nome Cliente",
    email: "cliente@email.com",
    phone: "(11) 12345-6789",
    checklist: ["Revisar documento", "Confirmar reunião"]
  };

  return (
    <div className="agenda-container">
      {/* Cabeçalho com perfis */}
      <header className="agenda-header">
        <TopProfiles profiles={profiles} />
      </header>

      {/* Corpo da agenda */}
      <div className="agenda-body">
        <aside className="agenda-sidebar">
          <ClientCard client={client} />
          <button onClick={() => setModalOpen(true)}>+ Adicionar Evento</button>
        </aside>

        <main className="agenda-calendar">
          <CalendarGrid />
        </main>

        <aside className="agenda-right">
          <SpotifyWidget playlistUrl="https://open.spotify.com/playlist/..." />
          <WhatsAppNotifications />
        </aside>
      </div>

      {/* Modal de evento */}
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default AgendaTemplate;