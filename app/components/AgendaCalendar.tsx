'use client'

import { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

/* ========= TIPOS LOCAIS (não quebra nada) ========= */

type AgendaEvent = {
  id: string
  title: string
  date: string
}

type ChecklistItem = {
  id: string
  text: string
  done: boolean
}

/* ================================================ */

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([
    {
      id: '1',
      title: 'Reunião Confi',
      date: '2026-01-28',
    },
  ])

  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  /* ========= CALENDÁRIO ========= */

  function handleDateClick(info: any) {
    const newEvent: AgendaEvent = {
      id: crypto.randomUUID(),
      title: 'Novo evento',
      date: info.dateStr,
    }

    setEvents(prev => [...prev, newEvent])
  }

  function handleEventClick(info: any) {
    const ev = info.event

    setSelectedEvent({
      id: ev.id,
      title: ev.title,
      date: ev.startStr,
    })

    // checklist começa vazio (simples e funcional)
    setChecklist([])
  }

  /* ========= CHECKLIST ========= */

  function toggleChecklist(id: string) {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    )
  }

  function addChecklistItem() {
    setChecklist(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: 'Nova tarefa',
        done: false,
      },
    ])
  }

  /* ========= UI ========= */

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* CALENDÁRIO */}
      <div style={{ flex: 1 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>

      {/* CHECKLIST LATERAL */}
      {selectedEvent && (
        <aside
          style={{
            width: 320,
            padding: 16,
            borderLeft: '1px solid #e5e5e5',
            background: '#fafafa',
          }}
        >
          <h3 style={{ marginBottom: 8 }}>Checklist</h3>
          <p style={{ fontSize: 14, color: '#666' }}>
            {selectedEvent.title}
          </p>

          <div style={{ marginTop: 12 }}>
            {checklist.map(item => (
              <label
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklist(item.id)}
                />
                <span
                  style={{
                    textDecoration: item.done ? 'line-through' : 'none',
                  }}
                >
                  {item.text}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={addChecklistItem}
            style={{
              marginTop: 12,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            + Adicionar tarefa
          </button>
        </aside>
      )}
    </div>
  )
}