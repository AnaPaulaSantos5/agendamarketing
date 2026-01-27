"use client";

import { useState } from "react";

type Perfil = "Confi" | "Cecília" | "Luiza" | "Júlio";

type Evento = {
  id: number;
  perfil: Perfil;
  tipo: "Story" | "Reel" | "Post" | "Tarefa";
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  CTA?: string;
  status: "Pendente" | "Concluído";
  data: string; // YYYY-MM-DD
  linkDrive?: string;
};

export default function AgendaBlocos() {
  const [eventos, setEventos] = useState<Evento[]>([
    {
      id: 1,
      perfil: "Confi",
      tipo: "Story",
      conteudoPrincipal: "Story motivacional: abertura semana",
      conteudoSecundario: "Enquete sobre objetivos",
      CTA: "Deseja falar com o marketing? ✅",
      status: "Pendente",
      data: "2026-01-26",
    },
    {
      id: 2,
      perfil: "Confi",
      tipo: "Reel",
      conteudoPrincipal: "Reel educativo: dica de consórcio",
      conteudoSecundario: "Story teaser do reel",
      CTA: "Deseja falar com o marketing? ✅",
      status: "Pendente",
      data: "2026-01-27",
    },
  ]);

  const [filtroPerfil, setFiltroPerfil] = useState<Perfil | "Todos">("Todos");

  const eventosFiltrados = eventos.filter(
    (e) => filtroPerfil === "Todos" || e.perfil === filtroPerfil
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>Agenda em Blocos</h1>

      <div style={{ marginBottom: 20 }}>
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

      <div style={{ display: "grid", gap: 15 }}>
        {eventosFiltrados.map((e) => (
          <div
            key={e.id}
            style={{
              border: "2px solid #1260c7",
              borderRadius: 8,
              padding: 15,
              background: "#f0f4ff",
              maxWidth: 400,
            }}
          >
            <strong>Data:</strong> {e.data} <br />
            <strong>Tipo:</strong> {e.tipo} <br />
            <strong>Conteúdo Principal:</strong> {e.conteudoPrincipal} <br />
            {e.conteudoSecundario && (
              <>
                <strong>Conteúdo Secundário:</strong> {e.conteudoSecundario} <br />
              </>
            )}
            {e.CTA && (
              <>
                <strong>CTA:</strong> {e.CTA} <br />
              </>
            )}
            <strong>Status:</strong> {e.status} <br />
            <strong>Perfil:</strong> {e.perfil} <br />
            {e.linkDrive && (
              <>
                <a href={e.linkDrive} target="_blank" rel="noreferrer">
                  Link do Drive
                </a>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}