"use client";

import React from "react";

// Tipos
interface Profile {
  name: string;
  photoUrl: string;
}

interface Client {
  name: string;
  status: string;
  tasks: string[];
}

// Dados de exemplo
const profiles: Profile[] = [
  { name: "Confi", photoUrl: "/images/confi.jpg" },
  { name: "Luiza", photoUrl: "/images/luiza.jpg" },
  { name: "Júlio", photoUrl: "/images/julio.jpg" },
  { name: "Cecília", photoUrl: "/images/cecilia.jpg" },
];

const testClients: Client[] = [
  { name: "Cliente 1", status: "Ativo", tasks: ["Tarefa A", "Tarefa B"] },
  { name: "Cliente 2", status: "Pendente", tasks: ["Tarefa C"] },
  { name: "Cliente 3", status: "Ativo", tasks: ["Tarefa D", "Tarefa E", "Tarefa F"] },
];

// Componentes internos
const TopProfiles: React.FC<{ profiles: Profile[] }> = ({ profiles }) => (
  <div className="flex gap-4">
    {profiles.map((p, idx) => (
      <div key={idx} className="flex flex-col items-center">
        <img
          src={p.photoUrl}
          alt={p.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <span className="text-sm mt-1">{p.name}</span>
      </div>
    ))}
  </div>
);

const ClientCard: React.FC<{ client: Client }> = ({ client }) => (
  <div className="p-2 mb-2 border rounded">
    <h4 className="font-bold">{client.name}</h4>
    <p>Status: {client.status}</p>
    <ul className="list-disc ml-4">
      {client.tasks.map((task, idx) => (
        <li key={idx}>{task}</li>
      ))}
    </ul>
  </div>
);

const SpotifyWidget: React.FC = () => (
  <div className="p-2 bg-green-500 text-white text-center rounded">
    Spotify Widget
  </div>
);

const WhatsAppWidget: React.FC = () => (
  <div className="p-2 bg-[#25D366] text-white text-center rounded">
    WhatsApp Widget
  </div>
);

// Template principal
export default function AgendaTemplate() {
  return (
    <div className="agenda-template flex flex-col p-4 gap-6">

      {/* Topo com perfis */}
      <header className="agenda-header mb-4">
        <TopProfiles profiles={profiles} />
      </header>

      {/* Painel de clientes */}
      <div className="flex gap-4">
        <div className="client-panel w-full md:w-1/4 p-4 border-r">
          <h3 className="text-lg font-bold mb-2">Clientes</h3>
          {testClients.map((client, idx) => (
            <ClientCard key={idx} client={client} />
          ))}
        </div>

        {/* Widgets */}
        <div className="flex flex-col flex-1 gap-4">
          <SpotifyWidget />
          <WhatsAppWidget />
        </div>
      </div>
    </div>
  );
}