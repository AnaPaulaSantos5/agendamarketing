// app/page.tsx ou onde você quiser renderizar a agenda
"use client";

import { useEffect, useState } from "react";

type AgendaItem = Record<string, any>; // permite qualquer estrutura de colunas

export default function AgendaPage() {
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const res = await fetch("/api/agenda");
        if (!res.ok) throw new Error(`Erro na API: ${res.status}`);
        const data = await res.json();

        // Se você tiver múltiplas abas, escolhe a aba "Agenda"
        const agendaData = data["Agenda"] || [];
        setAgenda(agendaData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    fetchAgenda();
  }, []);

  if (loading) return <p>Carregando agenda...</p>;
  if (error) return <p>Erro ao carregar agenda: {error}</p>;

  return (
    <div>
      <h1>Agenda</h1>
      {agenda.length === 0 && <p>Sem dados na agenda.</p>}
      {agenda.map((item, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "4px",
          }}
        >
          {Object.entries(item).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value || "Sem informação"}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}