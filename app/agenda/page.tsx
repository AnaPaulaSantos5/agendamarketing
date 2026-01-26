'use client'

import { useEffect, useState } from 'react'

export default function AgendaPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/agenda', { cache: 'no-store' })
        if (!res.ok) throw new Error(`Erro ao carregar: ${res.status}`)
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      }
    }

    fetchData()
  }, [])

  if (error) return <p>Erro: {error}</p>
  if (!data) return <p>Carregando...</p>

  return (
    <div style={{ padding: 24 }}>
      <h1>Agenda</h1>

      <h2>Agenda do Dia</h2>
      {data.agenda.map((item: any, index: number) => (
        <p key={index}>
          {item.time} — {item.title}
        </p>
      ))}

      <h2>Checklist</h2>
      {data.checklist.map((item: any) => (
        <label key={item.id} style={{ display: 'block' }}>
          <input type="checkbox" /> {item.text}
        </label>
      ))}
    </div>
  )
}
