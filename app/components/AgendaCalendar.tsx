"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { AgendaEvent } from "@/app/types/agenda";
import AgendaModal from "./AgendaModal";

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selected, setSelected] = useState<AgendaEvent | null>(null);

  const loadEvents = async () => {
    const res = await fetch("/api/agenda");
    setEvents(await res.json());
  };

  useEffect(() => {
    loadEvents();
  }, []);

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
          setSelected(info.event.extendedProps as AgendaEvent)
        }
      />

      {selected && (
        <AgendaModal
          event={selected}
          onClose={() => {
            setSelected(null);
            loadEvents();
          }}
        />
      )}
    </>
  );
}
