'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import AgendaCalendar, {
  AgendaEvent,
} from '@/app/components/AgendaCalendar';

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [createRange, setCreateRange] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // 🔹 carregar eventos da planilha
  async function loadEvents() {
    const res = await fetch('/api/agenda');
    const data = await res.json();
    setEvents(data || []);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // 🔹 criar novo evento
  function handleSelect(start: string, end: string) {
    setCreateRange({ start, end });
    setSelectedEvent(null);
  }

  // 🔹 editar evento existente
  function handleEventClick(event: AgendaEvent) {
    setSelectedEvent(event);
    setCreateRange(null);
  }

  return (
    <ProtectedRoute>
      <Header />

      <AgendaCalendar
        events={events}
        onSelect={handleSelect}
        onEventClick={handleEventClick}
      />

      {/* 
        Aqui entram:
        - EventModal (criar)
        - EventModal (editar)
        - Delete button
        Você já tem isso pronto, não mexi agora
      */}
    </ProtectedRoute>
  );
}
