'use client'

import { useState } from 'react'
import { TarefaItem } from '../types'

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<TarefaItem[]>([])

  function add() {
    setTarefas(prev => [...prev, {
      id: crypto.randomUUID(),
      blocoId: '',
      titulo: '',
      responsavel: '',
      data: '',
      status: '',
      linkDrive: '',
      notificar: false
    }])
  }

  return (
    <div>
      <button onClick={add}>Nova tarefa</button>

      {tarefas.map(t => (
        <div key={t.id}>
          <input placeholder="Título" />
          <input placeholder="Responsável" />
          <input type="date" />
          <input placeholder="Link Drive" />
        </div>
      ))}
    </div>
  )
}