"use client";
import React, { useState } from "react";
import TopProfiles from "../components/TopProfiles";
import ClientCard from "../components/ClientCard";
import CalendarGrid from "../components/CalendarGrid";
import EventModal from "../components/EventModal";
import SpotifyWidget from "../components/SpotifyWidget";
import "./AgendaTemplate.css";

const AgendaTemplate: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="agenda-template">
      {/* Topo com perfis */}
      <header className="agenda-header">
        <TopProfiles />
      </header>

      <div className="agenda-body">
        {/* Lateral esquerda com cliente */}
        <aside className="agenda-left">
          <ClientCard />
        </aside>

        {/* Calendário central */}
        <main className="agenda-center">
          <CalendarGrid />
        </main>

        {/* Lateral direita com Spotify */}
        <aside className="agenda-right">
          <SpotifyWidget />
        </aside>
      </div>

      {/* Modal de evento */}
      <EventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Botão flutuante para abrir modal */}
      <button
        className="floating-add-event"
        onClick={() => setModalOpen(true)}
      >
        + Adicionar Evento
      </button>
    </div>
  );
};

export default AgendaTemplate;