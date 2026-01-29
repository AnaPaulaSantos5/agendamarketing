'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

export type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  perfil?: string;
  tipoEvento?: string;
  status?: 'Pendente' | 'Concluída';
};

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 Carregar agenda
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((e: any) => ({
          id: e.id,
          title: e.conteudoPrincipal,
          start: e.start,
          end: e.end,
          perfil: e.perfil,
          tipoEvento: e.tipoEvento,
          status: e.tarefa?.status || 'Pendente',
        }));
        setEvents(formatted);
      });
  }, []);

  // 🔹 Clique no evento → abrir modal (VISUALIZAÇÃO)
  function handleEventClick(info: any) {
    const ev = events.find(e => e.id === info.event.id);
    if (!ev) return;
    setSelectedEvent(ev);
    setModalOpen(true);
  }

  // 🔹 Criar novo evento
  async function handleCreate(dateStr: string) {
    const newEvent: AgendaEvent = {
      id: '',
      title: 'Novo Evento',
      start: dateStr,
      status: 'Pendente',
    };

    setSelectedEvent(newEvent);
    setModalOpen(true);
  }

  // 🔹 Salvar (criar ou editar)
  async function handleSave(ev: AgendaEvent) {
    const method = ev.id ? 'PATCH' : 'POST';

    await fetch('/api/agenda', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: ev.id,
        start: ev.start,
        end: ev.end,
        conteudoPrincipal: ev.title,
        perfil: ev.perfil,
        tipoEvento: ev.tipoEvento,
        tarefa: { status: ev.status },
      }),
    });

    setEvents(prev => {
      if (!ev.id) {
        return [...prev, { ...ev, id: crypto.randomUUID() }];
      }
      return prev.map(e => (e.id === ev.id ? ev : e));
    });

    setModalOpen(false);
    setSelectedEvent(null);
  }

  // 🔹 Excluir
  async function handleDelete(id: string) {
    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    setEvents(prev => prev.filter(e => e.id !== id));
    setModalOpen(false);
  }

  // 🔹 Checklist (eventos pendentes do dia)
  const today = new Date().toISOString().slice(0, 10);
  const checklist = events.filter(
    e => e.start.startsWith(today) && e.status === 'Pendente'
  );

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* CALENDÁRIO */}
      <div style={{ flex: 1 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          events={events}
          eventClick={handleEventClick}
          dateClick={info => handleCreate(info.dateStr)}
        />
      </div>

      {/* CHECKLIST LATERAL REAL */}
      <aside
        style={{
          width: 320,
          borderLeft: '1px solid #ddd',
          padding: 16,
          background: '#fafafa',
        }}
      >
        <h3>Checklist de Hoje</h3>

        {checklist.length === 0 && <p>Nenhuma tarefa pendente</p>}

        {checklist.map(ev => (
          <div
            key={ev.id}
            style={{
              background: '#fff',
              padding: 12,
              borderRadius: 6,
              marginBottom: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            <strong>{ev.title}</strong>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button
                onClick={() =>
                  handleSave({ ...ev, status: 'Concluída' })
                }
              >
                Concluir
              </button>
              <button onClick={() => setSelectedEvent(ev)}>
                Reagendar
              </button>
              <button onClick={() => handleDelete(ev.id)}>
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </aside>

      {/* MODAL */}
      {selectedEvent && (
        <EventModal
          isOpen={modalOpen}
          event={selectedEvent}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}