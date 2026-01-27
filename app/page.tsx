"use client";

import { useEffect, useState } from "react";

type AgendaItem = {
  Data?: string;
  Tipo?: string;
  Conteudo_Principal?: string;
  Conteudo_Secundario?: string;
  CTA?: string;
  Status_Postagem?: string;
  Perfil?: string;
};

export default function AgendaPage() {
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgenda = async () => {
      try {
        const res = await fetch("/api/agenda");
        if (!res.ok) throw new Error(`Erro: ${res.status}`);
        const data = await res.json();
        setAgenda(data.Agenda || []);
      } catch (err: any) {
        console.error(err);
        setError("Não foi possível carregar a agenda.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgenda();
  }, []);

  if (loading) return <p className="text-center mt-10">Carregando agenda...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  const perfilColors: Record<string, string> = {
    "Confi Seguros": "bg-yellow-300",
    "Confi Finanças": "bg-blue-300",
    "Confi Benefícios": "bg-red-300",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Agenda de Marketing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agenda.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded shadow ${perfilColors[item.Perfil || ""] || "bg-gray-200"}`}
          >
            <p><strong>Data:</strong> {item.Data || "Sem data"}</p>
            <p><strong>Tipo:</strong> {item.Tipo || "Sem tipo"}</p>
            <p><strong>Conteúdo Principal:</strong> {item.Conteudo_Principal || "Sem conteúdo"}</p>
            <p><strong>Conteúdo Secundário:</strong> {item.Conteudo_Secundario || "Sem conteúdo"}</p>
            <p><strong>CTA:</strong> {item.CTA || "Sem CTA"}</p>
            <p><strong>Status:</strong> {item.Status_Postagem || "Sem status"}</p>
            <p><strong>Perfil:</strong> {item.Perfil || "Sem perfil"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}