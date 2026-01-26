'use client'

import { useEffect, useState } from 'react'
import { AgendaEvent, ChecklistItem } from '../../lib/types' // caminho relativo seguro

export default function AgendaPage() {
  const [data, setData] = useState<{ agenda: AgendaEvent[]; checklist: ChecklistItem[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/agenda')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar agenda')
        return res.json()
      })
      .then(setData)
      .catch(err => setError(err.message))
  }, [])

  if (error) return <p>Erro ao carregar: {error}</p>
  if (!data) return <p>Carregando...</p>

  return (
    <div style={{ padding: 24 }}>
      <h1>Agenda</h1>

      <h2>Agenda do Dia</h2>
      {data.agenda.map((item, index) => (
        <p key={index}>
          {item.time} — {item.title}
        </p>
      ))}

      <h2>Checklist</h2>
      {data.checklist.map(item => (
        <label key={item.id} style={{ display: 'block' }}>
          <input type="checkbox" /> {item.text}
        </label>
      ))}
    </div>
  )
}
