'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useState } from 'react'
import { AgendaItem } from '../types/agenda'
import EventModal from './EventModal'
import { v4 as uuid } from 'uuid'

export default function AgendaCalendar() {
  const [items, setItems] = useState<AgendaItem[]>([])
  const [selected, setSelected] = useState<AgendaItem | null>(null)

  function handleDateSelect(info: any) {
    setSelected({
      id: uuid(),
      title: '',
      start: info.startStr,
      end: info.endStr,
      allDay: info.allDay,
      category: 'evento',
      visibility: 'interno',
      status: 'pendente',
    })
  }

  function handleEventClick(info: any) {
    const found = items.find(i => i.id === info.event.id)
    if (found) setSelected(found)
  }

  function handleSave(item: AgendaItem) {
    setItems(prev => {
      const exists = prev.find(e => e.id === item.id)
      if (exists) {
        return prev.map(e => (e.id === item.id ? item : e))
      }
      return [...prev, item]
    })
    setSelected(null)
  }

  function handleDelete(id: string) {
    setItems(prev => prev.filter(e => e.id !== id))
    setSelected(null)
  }

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        events={items.map(i => ({
          id: i.id,
          title: i.title,
          start: i.start,
          end: i.end,
          allDay: i.allDay,
        }))}
        select={handleDateSelect}
        eventClick={handleEventClick}
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