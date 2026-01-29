'use client'

import { useState } from 'react'

type ChecklistItem = {
  id: string
  titulo: string
  data: string
  status: 'pendente' | 'concluida' | 'cancelada'
}

export default function ChecklistLateral() {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: '1',
      titulo: 'Criar flyer seguro residencial',
      data: '2026-01-28',
      status: 'pendente',
    },
    {
      id: '2',
      titulo: 'Post Instagram consórcio',
      data: '2026-01-28',
      status: 'pendente',
    },
  ])

  function atualizarStatus(id: string, status: ChecklistItem['status']) {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status } : item
      )
    )
  }

  return (
    <aside className="w-[320px] border-l px-4 py-4 bg-white">
      <h2 className="font-semibold text-lg mb-4">Checklist do dia</h2>

      <ul className="space-y-3">
        {items.filter(i => i.status === 'pendente').map(item => (
          <li key={item.id} className="border rounded p-3">
            <p className="font-medium">{item.titulo}</p>
            <p className="text-sm text-gray-500">{item.data}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => atualizarStatus(item.id, 'concluida')}
                className="text-sm px-2 py-1 bg-green-600 text-white rounded"
              >
                Concluir
              </button>

              <button
                onClick={() => atualizarStatus(item.id, 'pendente')}
                className="text-sm px-2 py-1 bg-yellow-500 text-white rounded"
              >
                Reagendar
              </button>

              <button
                onClick={() => atualizarStatus(item.id, 'cancelada')}
                className="text-sm px-2 py-1 bg-red-600 text-white rounded"
              >
                Cancelar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  )
}