'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState } from 'react'
import { AgendaItem } from '../types'
import EventModal from './EventModal'

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaItem[]>([])
  const [selected, setSelected] = useState<AgendaItem | null>(null)

  function handleDateClick(info: any) {
    setSelected({
      id: crypto.randomUUID(),
      dataInicio: info.dateStr,
      dataFim: info.dateStr,
      tipoEvento: '',
      tipo: '',
      conteudoPrincipal: '',
      conteudoSecundario: '',
      cta: '',
      statusPostagem: '',
      perfil: '',
      linkDrive: ''
    })
  }

  function handleSave(item: AgendaItem) {
    setEvents(prev => {
      const exists = prev.find(e => e.id === item.id)
      if (exists) {
        return prev.map(e => e.id === item.id ? item : e)
      }
      return [...prev, item]
    })
    setSelected(null)
  }

  function handleDelete(id: string) {
    setEvents(prev => prev.filter(e => e.id !== id))
    setSelected(null)
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        dateClick={handleDateClick}
        events={events.map(e => ({
          id: e.id,
          title: e.conteudoPrincipal || 'Evento',
          start: e.dataInicio,
          end: e.dataFim
        }))}
        height="auto"
      />

      {selected && (
        <EventModal
          item={selected}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}