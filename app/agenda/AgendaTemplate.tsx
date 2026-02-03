"use client";

import React, { useState } from "react";

// Components
import TopProfiles, { Profile } from "../components/TopProfiles";
import ClientCard from "../components/ClientCard";
import CalendarGrid from "../components/CalendarGrid";
import EventModal from "../components/EventModal";
import SpotifyWidget from "../components/SpotifyWidget";
import WhatsAppWidget from "../components/WhatsAppWidget";

// Dados de teste
const testProfiles: Profile[] = [
  { name: "Confi", photoUrl: "https://via.placeholder.com/40" },
  { name: "Luiza", photoUrl: "https://via.placeholder.com/40" },
  { name: "Júlio", photoUrl: "https://via.placeholder.com/40" },
  { name: "Cecília", photoUrl: "https://via.placeholder.com/40" },
];

const testClients = [
  { name: "Cliente A", status: "Pendente", tasks: ["Enviar proposta", "Confirmar reunião"] },
  { name: "Cliente B", status: "Concluído", tasks: ["Reunião realizada", "Checklist preenchido"] },
  { name: "Cliente C", status: "Em andamento", tasks: ["Documentação pendente"] },
];

const AgendaTemplate: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="agenda-container" style={{ display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif" }}>
      
      {/* Topo com perfis */}
      <header className="agenda-header" style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#f0f0f0" }}>
        <h2>Agenda Marketing</h2>
        <TopProfiles profiles={testProfiles} />
      </header>

      {/* Corpo da agenda */}
      <div className="agenda-body" style={{ display: "flex", gap: "20px", padding: "20px" }}>
        
        {/* Calendário */}
        <div className="calendar-section" style={{ flex: 2 }}>
          <CalendarGrid />
        </div>

        {/* Painel lateral */}
        <aside className="sidebar" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Clientes */}
          <div className="clients-panel" style={{ background: "#fff", padding: "10px", borderRadius: "8px", boxShadow: "0 0 5px rgba(0,0,0,0.1)" }}>
            <h3>Clientes</h3>
            {testClients.map((client, idx) => (
              <ClientCard key={idx} client={client} />
            ))}
          </div>

          {/* Widgets */}
          <div className="widgets-panel" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <SpotifyWidget />
            <WhatsAppWidget />
          </div>

          {/* Botão abrir modal */}
          <button
            style={{ padding: "10px", borderRadius: "5px", background: "#0070f3", color: "#fff", border: "none", cursor: "pointer" }}
            onClick={() => setModalOpen(true)}
          >
            Criar Evento
          </button>
        </aside>
      </div>

      {/* Modal de evento */}
      <EventModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Footer de teste */}
      <footer style={{ textAlign: "center", padding: "10px", background: "#f0f0f0" }}>
        Template de agenda visual completo
      </footer>
    </div>
  );
};

export default AgendaTemplate;