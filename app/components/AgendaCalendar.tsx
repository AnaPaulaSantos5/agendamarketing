'use client'

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

/* ================= TYPES ================= */

export type Tarefa = {
  titulo: string
  status: 'Pendente' | 'Concluída'
  data: string
}

export type AgendaEvent = {
  id: string
  title: string
  start: string
  end?: string
  tarefa?: Tarefa
}

/* ================= COMPONENT ================= */

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([])
  const [loading, setLoading] = useState(true)

  /* ===== LOAD ===== */
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => setEvents(data))
      .finally(() => setLoading(false))
  }, [])

  /* ===== CREATE ===== */
  async function createEvent(dateStr: string) {
    const title = prompt('Título do evento')
    if (!title) return

    const newEvent = {
      title,
      start: dateStr,
      tarefa: {
        titulo: title,
        status: 'Pendente',
        data: dateStr
      }
    }

    const res = await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    })

    const saved = await res.json()
    setEvents(prev => [...prev, saved])
  }

  /* ===== UPDATE ===== */
  async function updateEvent(event: AgendaEvent) {
    await fetch('/api/agenda', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })

    setEvents(prev =>
      prev.map(e => (e.id === event.id ? event : e))
    )
  }

  /* ===== DELETE ===== */
  async function deleteEvent(id: string) {
    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })

    setEvents(prev => prev.filter(e => e.id !== id))
  }

  /* ===== CHECKLIST ACTIONS ===== */
  function concluir(event: AgendaEvent) {
    updateEvent({
      ...event,
      tarefa: { ...event.tarefa!, status: 'Concluída' }
    })
  }

  function reagendar(event: AgendaEvent) {
    const novaData = prompt('Nova data (YYYY-MM-DD)')
    if (!novaData) return

    updateEvent({
      ...event,
      start: novaData,
      tarefa: { ...event.tarefa!, data: novaData }
    })
  }

  if (loading) return <p>Carregando agenda...</p>

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* ================= CALENDAR ================= */}
      <div style={{ flex: 3 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={info => createEvent(info.dateStr)}
          eventClick={info => {
            const ev = events.find(e => e.id === info.event.id)
            if (!ev) return

            const action = prompt(
              'Digite:\n1 = Editar título\n2 = Excluir'
            )

            if (action === '1') {
              const novoTitulo = prompt('Novo título', ev.title)
              if (!novoTitulo) return
              updateEvent({ ...ev, title: novoTitulo })
            }

            if (action === '2') {
              deleteEvent(ev.id)
            }
          }}
        />
      </div>

      {/* ================= CHECKLIST ================= */}
      <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: 16 }}>
        <h3>Checklist</h3>

        {events.filter(e => e.tarefa).length === 0 && (
          <p>Nenhuma tarefa</p>
        )}

        {events
          .filter(e => e.tarefa)
          .map(event => (
            <div
              key={event.id}
              style={{
                marginBottom: 12,
                padding: 8,
                border: '1px solid #ccc'
              }}
            >
              <strong>{event.tarefa!.titulo}</strong>
              <p>Status: {event.tarefa!.status}</p>

              <div style={{ display: 'flex', gap: 6 }}>
                {event.tarefa!.status === 'Pendente' && (
                  <button onClick={() => concluir(event)}>
                    Concluir
                  </button>
                )}
                <button onClick={() => reagendar(event)}>
                  Reagendar
                </button>
                <button onClick={() => deleteEvent(event.id)}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}