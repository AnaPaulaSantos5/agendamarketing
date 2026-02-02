"use client";
import React, { useState } from "react";
import TopProfiles, { Profile } from "../components/TopProfiles";
import ClientCard from "../components/ClientCard";
import CalendarGrid from "../components/CalendarGrid";
import EventModal from "../components/EventModal";
import SpotifyWidget from "../components/SpotifyWidget";
import WhatsAppNotifications from "../components/WhatsAppNotifications";
import "../styles/AgendaTemplate.css"; // CSS do template

const AgendaTemplate: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  // Perfis simulados com foto
  const profiles: Profile[] = [
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
        {/* Sidebar esquerda */}
        <aside className="agenda-sidebar">
          <ClientCard client={client} />
          <button className="btn-add-event" onClick={() => setModalOpen(true)}>
            + Adicionar Evento
          </button>
        </aside>

        {/* Calendário central */}
        <main className="agenda-calendar">
          <CalendarGrid />
        </main>

        {/* Sidebar direita */}
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