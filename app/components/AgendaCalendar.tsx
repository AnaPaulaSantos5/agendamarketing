"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";

export type AgendaEvent = {
  id?: number;
  title: string;
  start: string;
  end: string;
  perfil: string;
};

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selected, setSelected] = useState<AgendaEvent | null>(null);

  useEffect(() => {
    fetch("/api/agenda")
      .then(res => res.json())
      .then(setEvents);
  }, []);

  const handleSave = async () => {
    if (!selected) return;

    await fetch("/api/agenda", {
      method: selected.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selected),
    });

    const updated = await fetch("/api/agenda").then(r => r.json());
    setEvents(updated);
    setSelected(null);
  };

  const handleDelete = async () => {
    if (!selected?.id) return;

    await fetch("/api/agenda", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id }),
    });

    const updated = await fetch("/api/agenda").then(r => r.json());
    setEvents(updated);
    setSelected(null);
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        selectable
        select={(info) =>
          setSelected({
            title: "",
            start: info.startStr,
            end: info.endStr,
            perfil: "",
          })
        }
        eventClick={(info) =>
          setSelected({
            id: Number(info.event.id),
            title: info.event.title,
            start: info.event.startStr,
            end: info.event.endStr!,
            perfil: info.event.extendedProps.perfil,
          })
        }
      />

      {selected && (
        <div className="modal">
          <input
            value={selected.title}
            onChange={e =>
              setSelected({ ...selected, title: e.target.value })
            }
            placeholder="Título"
          />

          <button onClick={handleSave}>Salvar</button>

          {selected.id && (
            <button onClick={handleDelete} style={{ color: "red" }}>
              Excluir evento
            </button>
          )}

          <button onClick={() => setSelected(null)}>Cancelar</button>
        </div>
      )}
    </>
  );
}
