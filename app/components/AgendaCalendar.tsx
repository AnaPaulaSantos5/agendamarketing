"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import EventModal from "./EventModal";

/* =======================
TIPOS
======================= */
export type Perfil = "Confi" | "Cecília" | "Luiza" | "Júlio";

export type AgendaEvent = {
  id: string;
  start: string;
  end?: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  perfil: Perfil;
  tarefa?: {
    responsavelChatId?: string;
    linkDrive?: string;
  } | null;
};

type PerfilConfig = Record<Perfil, { chatId: string }>;

const PERFIS: Perfil[] = ["Confi", "Cecília", "Luiza", "Júlio"];

/* =======================
COMPONENTE
======================= */
export default function AgendaCalendar({ isAdmin = true }) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfilConfig, setPerfilConfig] = useState<PerfilConfig>({
    Confi: { chatId: "" },
    Cecília: { chatId: "" },
    Luiza: { chatId: "" },
    Júlio: { chatId: "" },
  });

  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [modalOpen, setModalOpen] = useState(false);

  /* =======================
CARREGAR DADOS (API = VERDADE)
======================= */
  async function loadAgenda() {
    const res = await fetch("/api/agenda");
    const data = await res.json();

    setEvents(Array.isArray(data.events) ? data.events : []);

    if (data.perfis) {
      setPerfilConfig(data.perfis);
    }
  }

  useEffect(() => {
    loadAgenda();
  }, []);

  /* =======================
SALVAR CHATIDS (ADMIN)
======================= */
  async function salvarChatIds() {
    await fetch("/api/agenda", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ perfilConfig }),
    });
    await loadAgenda();
    alert("ChatIDs salvos");
  }

  /* =======================
CRIAR EVENTO
======================= */
  function handleSelect(info: DateSelectArg) {
    setSelectedEvent(null);
    setSelectedDate({ start: info.startStr, end: info.endStr });
    setModalOpen(true);
  }

  /* =======================
EDITAR EVENTO
======================= */
  function handleEventClick(click: EventClickArg) {
    const ev = events.find(e => e.id === click.event.id);
    if (!ev) return;

    setSelectedEvent(ev);
    setSelectedDate({ start: ev.start, end: ev.end || ev.start });
    setModalOpen(true);
  }

  /* =======================
SALVAR EVENTO (API)
======================= */
  async function handleSave(data: AgendaEvent) {
    await fetch("/api/agenda", {
      method: data.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setModalOpen(false);
    setSelectedEvent(null);
    await loadAgenda();
  }

  /* =======================
EXCLUIR EVENTO
======================= */
  async function handleDelete(id: string) {
    await fetch("/api/agenda", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setModalOpen(false);
    setSelectedEvent(null);
    await loadAgenda();
  }

  /* =======================
RENDER
======================= */
  return (
    <div style={{ display: "flex", height: "100%" }}>
      {/* 🔹 LATERAL PERFIS */}
      <aside style={{ width: 260, padding: 16, borderRight: "1px solid #ddd" }}>
        <h3>Perfis</h3>

        {PERFIS.map(perfil => (
          <div key={perfil} style={{ marginBottom: 12 }}>
            <strong>{perfil}</strong>
            {isAdmin && (
              <input
                placeholder="ChatId"
                value={perfilConfig[perfil].chatId}
                onChange={e =>
                  setPerfilConfig(prev => ({
                    ...prev,
                    [perfil]: { chatId: e.target.value },
                  }))
                }
                style={{ width: "100%" }}
              />
            )}
          </div>
        ))}

        {isAdmin && (
          <button onClick={salvarChatIds}>Salvar ChatIDs</button>
        )}
      </aside>

      {/* 🔹 CALENDÁRIO */}
      <main style={{ flex: 1, padding: 16 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable
          select={handleSelect}
          eventClick={handleEventClick}
          events={events.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
          }))}
          height="auto"
        />
      </main>

      {/* 🔹 MODAL */}
      {modalOpen && (
        <EventModal
          event={selectedEvent}
          start={selectedDate.start}
          end={selectedDate.end}
          perfilConfig={perfilConfig}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
