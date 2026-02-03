// /app/components/ClientCard.tsx
"use client";

import React from "react";

// Interface para a prop que o componente vai receber
interface Client {
  name: string;
  status: string;
  tasks: string[];
}

interface ClientCardProps {
  client: Client;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h4 style={{ margin: "0 0 5px 0" }}>{client.name}</h4>
      <p style={{ margin: "0 0 5px 0" }}>Status: {client.status}</p>
      <ul style={{ paddingLeft: "20px", margin: 0 }}>
        {client.tasks.map((task, idx) => (
          <li key={idx}>{task}</li>
        ))}
      </ul>
    </div>
  );
};

export default ClientCard;
