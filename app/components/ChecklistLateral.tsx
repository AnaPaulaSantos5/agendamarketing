'use client'

import { useEffect, useState } from 'react'
import { AgendaItem } from '../types/agenda'

export default function ChecklistLateral() {
  const [tasks, setTasks] = useState<AgendaItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('agenda-items')
    if (stored) {
      const all: AgendaItem[] = JSON.parse(stored)
      setTasks(all.filter(i =>
        i.category === 'tarefa' && i.status === 'pendente'
      ))
    }
  }, [])

  function concluir(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div style={{ padding: 16 }}>
      <h4>Checklist de hoje</h4>

      {tasks.map(t => (
        <div key={t.id}>
          <input type="checkbox" onChange={() => concluir(t.id)} />
          {t.title}
        </div>
      ))}
    </div>
  )
}