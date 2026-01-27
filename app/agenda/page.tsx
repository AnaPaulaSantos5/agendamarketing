"use client";

import { useState } from "react";

type Perfil = "Confi" | "Cecília" | "Luiza" | "Júlio";

type Evento = {
  id: number;
  perfil: Perfil;
  produto: string;
  tipo: "Story" | "Reel" | "Post" | "Tarefa";
  descricao: string;
  linkDrive?: string;
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;    // YYYY-MM-DD
};

export default function Agenda() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [filtroPerfil, setFiltroPerfil] = useState<Perfil | "Todos">("Todos");

  const eventosFiltrados = eventos.filter(
    (e) => filtroPerfil === "Todos" || e.perfil === filtroPerfil
  );

  const adicionarEvento = (evento: Evento) => {
    setEventos([...eventos, { ...evento, id: eventos.length + 1 }]);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Agenda</h1>

      <div>
        <label>Filtrar por perfil: </label>
        <select
          value={filtroPerfil}
          onChange={(e) => setFiltroPerfil(e.target.value as Perfil | "Todos")}
        >
          <option value="Todos">Todos</option>
          <option value="Confi">Confi</option>
          <option value="Cecília">Cecília</option>
          <option value="Luiza">Luiza</option>
          <option value="Júlio">Júlio</option>
        </select>
      </div>

      <div style={{ marginTop: 20 }}>
        {eventosFiltrados.map((e) => (
          <div key={e.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
            <strong>{e.tipo} - {e.produto}</strong><br/>
            Perfil: {e.perfil}<br/>
            De: {e.dataInicio} Até: {e.dataFim}<br/>
            {e.descricao}<br/>
            {e.linkDrive && (
              <a href={e.linkDrive} target="_blank" rel="noreferrer">Link do Drive</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}