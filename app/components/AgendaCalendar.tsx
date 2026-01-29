'use client'

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import { AgendaEvent } from './app/types'
import EventModal from './EventModal'

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)

  useEffect(() => {
    fetch('/api/agenda')
      .then((r) => r.json())
      .then(setEvents)
  }, [])

  function handleSave(ev: AgendaEvent) {
    setEvents((prev) =>
      prev.some((e) => e.id === ev.id)
        ? prev.map((e) => (e.id === ev.id ? ev : e))
        : [...prev, { ...ev, id: crypto.randomUUID() }]
    )
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setSelectedEvent(null)
  }

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
        }))}
        dateClick={(info) =>
          setSelectedEvent({
            id: '',
            title: '',
            date: info.dateStr,
            tipo: 'tarefa',
            status: 'pendente',
            perfil: 'Confi',
          })
        }
        eventClick={(info) => {
          const ev = events.find((e) => e.id === info.event.id)
          if (ev) setSelectedEvent(ev)
        }}
      />

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}