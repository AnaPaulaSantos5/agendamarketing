'use client'

import { useEffect, useState } from 'react'

export default function AgendaPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <p>Carregando...</p>

  return (
    <div>
      <h1>Agenda</h1>

      <h2>Agenda do Dia</h2>
      {data.agenda.map((item: any) => (
        <p key={item.title}>
          {item.time} — {item.title}
        </p>
      ))}

      <h2>Checklist</h2>
      {data.checklist.map((item: any) => (
        <label key={item.id}>
          <input type="checkbox" />
          {item.text}
        </label>
      ))}
    </div>
  )
}
