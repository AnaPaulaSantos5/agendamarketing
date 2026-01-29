'use client'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState } from 'react'
import { AgendaEvent } from '../types/AgendaEvent'
import ChecklistLateral from './ChecklistLateral'
import EventModal from './EventModal'
import { v4 as uuid } from 'uuid'

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleDateClick = (arg: any) => {
    const novoEvento: AgendaEvent = {
      id: uuid(),
      title: 'Nova tarefa',
      date: arg.dateStr,
      tipo: 'tarefa',
      status: 'pendente',
      perfil: 'Confi'
    }

    setEvents(prev => [...prev, novoEvento])
  }

  const handleEventClick = (info: any) => {
    const ev = events.find(e => e.id === info.event.id)
    if (!ev) return
    setSelectedEvent(ev)
    setIsModalOpen(true)
  }

  const updateEvent = (updated: AgendaEvent) => {
    setEvents(prev =>
      prev.map(e => (e.id === updated.id ? updated : e))
    )
    setSelectedEvent(updated)
  }

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    setIsModalOpen(false)
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
        />
      </div>

      <ChecklistLateral
        events={events}
        onUpdate={updateEvent}
        onDelete={deleteEvent}
      />

      <EventModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={() => setIsModalOpen(false)}
        onSave={updateEvent}
        onDelete={deleteEvent}
      />
    </div>
  )
}