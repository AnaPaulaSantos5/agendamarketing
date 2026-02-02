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

  // Exemplo de perfil de clientes (apenas visual)
  const client = {
    name: "Nome Cliente",
    email: "cliente@email.com",
    phone: "12345",
    checklist: ["Revisar documento", "Confirmar reunião"]
  };

  return (
    <div className="agenda-container">
      {/* Topo com perfis */}
      <header className="agenda-header">
        <TopProfiles profiles={["Confi", "Luiza", "Júlio", "Cecília"]} />
      </header>

      {/* Corpo da agenda */}
      <div className="agenda-body">
        {/* Lateral esquerda: foto do cliente, dados e checklist */}
        <aside className="agenda-sidebar">
          <ClientCard client={client} />
          <button onClick={() => setModalOpen(true)}>+ Adicionar Evento</button>
        </aside>

        {/* Calendário central */}
        <main className="agenda-calendar">
          <CalendarGrid />
        </main>

        {/* Lateral direita: Spotify e notificações */}
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