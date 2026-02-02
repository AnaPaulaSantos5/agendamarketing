"use client";

import { AgendaEvent } from "./AgendaCalendar";
import { useState } from "react";

type Props = {
  event: AgendaEvent;
  onSave: (event: AgendaEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export default function AgendaModal({
  event,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [form, setForm] = useState<AgendaEvent>(event);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">
          {form.id ? "Editar evento" : "Novo evento"}
        </h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Título"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={form.start}
          onChange={(e) =>
            setForm({ ...form, start: e.target.value })
          }
        />

        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={form.end || ""}
          onChange={(e) =>
            setForm({ ...form, end: e.target.value })
          }
        />

        <div className="flex justify-between pt-4">
          {form.id && (
            <button
              className="text-red-600"
              onClick={() => onDelete(form.id)}
            >
              Excluir
            </button>
          )}

          <div className="space-x-2">
            <button onClick={onClose}>Cancelar</button>
            <button
              className="bg-black text-white px-4 py-1 rounded"
              onClick={() => onSave(form)}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
