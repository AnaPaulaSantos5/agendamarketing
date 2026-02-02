'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Header from '@/app/components/Header';
import AgendaCalendar from '@/app/components/AgendaCalendar';
import EventModal from '@/app/components/EventModal';

export interface AgendaEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  perfil?: string;
}

export interface Perfil {
  nome: string;
  chatId: string;
}

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [perfilFiltro, setPerfilFiltro] = useState<string>('Todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  async function fetchAll() {
    const [ev, pf] = await Promise.all([
      fetch('/api/agenda').then(r => r.json()),
      fetch('/api/perfil').then(r => r.json()),
    ]);

    setEvents(ev);
    setPerfis(pf);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  function handleDateSelect(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedEvent(null);
    setModalOpen(true);
  }

  function handleEventClick(event: AgendaEvent) {
    setSelectedEvent(event);
    setSelectedDate(null);
    setModalOpen(true);
  }

  async function handleSave(data: any) {
    await fetch('/api/agenda', {
      method: selectedEvent ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setModalOpen(false);
    setSelectedEvent(null);
    await fetchAll();
  }

  async function handleDelete(id: string) {
    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setModalOpen(false);
    setSelectedEvent(null);
    await fetchAll();
  }

  const eventosFiltrados =
    perfilFiltro === 'Todos'
      ? events
      : events.filter(e => e.perfil === perfilFiltro);

  return (
    <ProtectedRoute>
      <Header />

      <div style={{ padding: 16 }}>
        <label>Perfil:&nbsp;</label>
        <select
          value={perfilFiltro}
          onChange={e => setPerfilFiltro(e.target.value)}
        >
          <option value="Todos">Todos</option>
          {perfis.map(p => (
            <option key={p.nome} value={p.nome}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>

      <AgendaCalendar
        events={eventosFiltrados}
        onSelectDate={handleDateSelect}
        onEventClick={handleEventClick}
      />

      {modalOpen && (
        <EventModal
          event={selectedEvent}
          date={selectedDate}
          perfis={perfis}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => {
            setModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </ProtectedRoute>
  );
}
