'use client'

import { useEffect, useState } from 'react'

type AgendaEvent = {
  date: string
  time: string
  title: string
  client: string
}

type ChecklistItem = {
  id: string
  text: string
  done: boolean
  time?: string
}

type AgendaData = {
  agenda: AgendaEvent[]
  checklist: ChecklistItem[]
}

export default function AgendaPage() {
  const [data, setData] = useState<AgendaData | null>(null)
  const [selectedClient, setSelectedClient] = useState('Confi')

  // Busca os dados da API
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Erro ao carregar agenda', err))
  }, [])

  if (!data) return <p>Carregando...</p>

  // Filtra agenda e checklist pelo cliente selecionado
  const filteredAgenda = data.agenda.filter(ev => ev.client === selectedClient)
  const filteredChecklist = data.checklist.filter(item =>
    filteredAgenda.some(ev => ev.time === item.time)
  )

  const toggleChecklist = (id: string) => {
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        checklist: prev.checklist.map(item =>
          item.id === id ? { ...item, done: !item.done } : item
        )
      }
    })
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Agenda</h1>

      <div style={{ marginBottom: 24 }}>
        <label>
          Filtro por cliente:{' '}
          <select
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
          >
            {/* Futuramente pode adicionar mais clientes */}
            <option value="Confi">Confi</option>
          </select>
        </label>
      </div>

      <h2>Agenda do Dia</h2>
      {filteredAgenda.map((item, index) => (
        <p key={index}>
          {item.time} — {item.title}
        </p>
      ))}

      <h2>Checklist</h2>
      {filteredChecklist.map(item => (
        <label key={item.id} style={{ display: 'block', marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={item.done}
            onChange={() => toggleChecklist(item.id)}
          />{' '}
          {item.text}
        </label>
      ))}
    </div>
  )
}
