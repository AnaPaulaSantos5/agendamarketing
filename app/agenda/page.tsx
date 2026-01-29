'use client'

import AgendaCalendar from '../components/AgendaCalendar'
import ChecklistLateral from '../components/ChecklistLateral'

export default function AgendaPage() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <AgendaCalendar />
      </div>
      <div style={{ width: 320, borderLeft: '1px solid #ddd' }}>
        <ChecklistLateral />
      </div>
    </div>
  )
}