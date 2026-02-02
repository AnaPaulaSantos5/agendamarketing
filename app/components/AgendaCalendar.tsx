"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  DateSelectArg,
  EventClickArg,
} from "@fullcalendar/interaction";
import { useState } from "react";
import AgendaModal from "./AgendaModal";

/* =======================
   TIPAGEM CORRETA
======================= */
export type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
};

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  /* =======================
     CRIAR EVENTO
  ======================= */
  function handleSelect(info: DateSelectArg) {
    setSelectedEvent({
      id: "",
      title: "",
      start: info.startStr,
      end: info.endStr,
    });
    setIsOpen(true);
  }

  /* =======================
     EDITAR EVENTO
  ======================= */
  function handleEventClick(click: EventClickArg) {
    setSelectedEvent({
      id: String(click.event.id),
      title: click.event.title,
      start: click.event.startStr,
      end: click.event.endStr || undefined,
    });
    setIsOpen(true);
  }

  /* =======================
     SALVAR EVENTO
  ======================= */
  function handleSave(event: AgendaEvent) {
    if (event.id) {
      // editar
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? event : e))
      );
    } else {
      // criar
      setEvents((prev) => [
        ...prev,
        { ...event, id: crypto.randomUUID() },
      ]);
    }

    setIsOpen(false);
    setSelectedEvent(null);
  }

  /* =======================
     EXCLUIR EVENTO
  ======================= */
  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setIsOpen(false);
    setSelectedEvent(null);
  }

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
        selectable
        select={handleSelect}
        eventClick={handleEventClick}
        events={events}
        height="auto"
      />

      {isOpen && selectedEvent && (
        <AgendaModal
          event={selectedEvent}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
