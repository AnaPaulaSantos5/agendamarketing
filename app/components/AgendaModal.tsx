"use client";

import { AgendaEvent } from "@/app/types/agenda";
import { useState } from "react";

export default function AgendaModal({
  event,
  onClose,
}: {
  event: AgendaEvent;
  onClose: () => void;
}) {
  const [form, setForm] = useState(event);

  const save = async () => {
    await fetch("/api/agenda", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onClose();
  };

  const remove = async () => {
    await fetch("/api/agenda", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: form.id }),
    });
    onClose();
  };

  return (
    <div className="modal">
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Título"
      />

      <input
        value={form.perfil}
        onChange={(e) => setForm({ ...form, perfil: e.target.value })}
        placeholder="Perfil"
      />

      <button onClick={save}>Salvar</button>
      {form.id && <button onClick={remove}>Excluir</button>}
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
