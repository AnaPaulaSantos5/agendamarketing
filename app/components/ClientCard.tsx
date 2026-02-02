"use client";
import React from "react";
import "./ClientCard.css";

const ClientCard: React.FC = () => {
  return (
    <div className="client-card">
      <img src="/profiles/google-placeholder.png" alt="Cliente" />
      <h3>Nome do Cliente</h3>
      <p>Email: cliente@email.com</p>
      <p>Telefone: 12345</p>

      <div className="checklist">
        <h4>Checklist</h4>
        <ul>
          <li>Revisar documento</li>
          <li>Confirmar reunião</li>
          <li>Enviar proposta</li>
        </ul>
      </div>

      <button>+ Adicionar Evento</button>
    </div>
  );
};

export default ClientCard;