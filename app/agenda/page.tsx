'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Header from '@/app/components/Header';
import AgendaCalendar, {
  CalendarEvent,
} from '@/app/components/AgendaCalendar';

/* =======================
   TIPOS
======================= */
export interface AgendaEvent extends CalendarEvent {}

interface Perfil {
  id: string;
  nome: string;
  chatId?: string;
}

/* =======================
   PAGE
======================= */
export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);

  const [form, setForm] = useState({
    title: '',
    start: '',
    end: '',
    perfil: '',
  });

  /* =======================
     LOAD INICIAL
  ======================= */
  useEffect(() => {
    loadEvents();
    loadPerfis();
  }, []);

  async function loadEvents() {
    const res = await fetch('/api/events');
    const data = await res.json();
    setEvents(data);
  }

  async function loadPerfis() {
    const res = await fetch('/api/perfis');
    const data = await res.json();
    setPerfis(data);
  }

  /* =======================
     NOVO EVENTO
  ======================= */
  function handleSelect(start: string, end: string) {
    setEditingEvent(null);
    setForm({ title: '', start, end, perfil: '' });
    setModalOpen(true);
  }

  /* =======================
     EDITAR EVENTO
  ======================= */
  function handleEventClick(event: AgendaEvent) {
    setEditingEvent(event);
    setForm({
      title: event.title,
      start: event.start,
      end: event.end ?? '',
      perfil: event.perfil ?? '',
    });
    setModalOpen(true);
  }

  /* =======================
     SALVAR
  ======================= */
  async function handleSave() {
    if (editingEvent) {
      await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }

    setModalOpen(false);
    await loadEvents();
  }

  /* =======================
     EXCLUIR
  ======================= */
  async function handleDelete() {
    if (!editingEvent) return;

    await fetch(`/api/events/${editingEvent.id}`, {
      method: 'DELETE',
    });

    setModalOpen(false);
    await loadEvents();
  }

  /* =======================
     UI
  ======================= */
  return (
    <ProtectedRoute>
      <Header />

      <AgendaCalendar
        events={events}
        onSelect={handleSelect}
        onEventClick={handleEventClick}
      />

      {modalOpen && (
        <div className="modal">
          <h2>{editingEvent ? 'Editar evento' : 'Novo evento'}</h2>

          <input
            placeholder="Título"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <input
            type="datetime-local"
            value={form.start}
            onChange={(e) =>
              setForm({ ...form, start: e.target.value })
            }
          />

          <input
            type="datetime-local"
            value={form.end}
            onChange={(e) =>
              setForm({ ...form, end: e.target.value })
            }
          />

          <select
            value={form.perfil}
            onChange={(e) =>
              setForm({ ...form, perfil: e.target.value })
            }
          >
            <option value="">Selecione o perfil</option>
            {perfis.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSave}>Salvar</button>

            {editingEvent && (
              <button
                onClick={handleDelete}
                style={{ background: 'red', color: '#fff' }}
              >
                Excluir
              </button>
            )}

            <button onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
