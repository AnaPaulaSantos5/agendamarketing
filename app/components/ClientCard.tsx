import React from 'react';
import { Client } from '../types';

interface ClientCardProps {
  client: Client;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => (
  <div className="client-card p-2 border mb-2 rounded">
    <h4>{client.name}</h4>
    <p>Status: {client.status}</p>
    <ul>
      {client.tasks.map((task, idx) => (
        <li key={idx}>{task}</li>
      ))}
    </ul>
  </div>
);

export default ClientCard;