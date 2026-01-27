"use client";

import { useEffect, useState } from "react";

type AgendaItem = {
  nome: string;
  email: string;
  telefone: string;
};

export default function HomePage() {
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/agenda")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAgenda(data);
        }
      })
      .catch((err) => setError("Erro ao carregar agenda"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Carregando agenda...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Agenda</h1>
      <ul>
        {agenda.map((item, idx) => (
          <li key={idx}>
            <strong>Nome:</strong> {item.nome ?? "Sem nome"} <br />
            <strong>Email:</strong> {item.email ?? "Sem email"} <br />
            <strong>Telefone:</strong> {item.telefone ?? "Sem telefone"}
          </li>
        ))}
      </ul>
    </div>
  );
}