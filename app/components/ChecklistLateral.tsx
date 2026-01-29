'use client'
import { AgendaEvent } from '../types/AgendaEvent'

type Props = {
  events: AgendaEvent[]
  onUpdate: (event: AgendaEvent) => void
  onDelete: (id: string) => void
}

export default function ChecklistLateral({ events, onUpdate, onDelete }: Props) {
  const tarefasPendentes = events.filter(
    e => e.tipo === 'tarefa' && e.status === 'pendente'
  )

  return (
    <aside className="w-[320px] border-l p-4 bg-gray-50">
      <h2 className="font-semibold text-lg mb-4">Checklist</h2>

      {tarefasPendentes.length === 0 && (
        <p className="text-sm text-gray-500">Nenhuma tarefa pendente</p>
      )}

      {tarefasPendentes.map(tarefa => (
        <div key={tarefa.id} className="bg-white border rounded p-3 mb-3">
          <p className="font-medium">{tarefa.title}</p>
          <p className="text-xs text-gray-500">{tarefa.date}</p>

          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() =>
                onUpdate({ ...tarefa, status: 'concluida' })
              }
              className="bg-green-600 text-white px-2 py-1 rounded text-xs"
            >
              Concluir
            </button>

            <button
              onClick={() =>
                onUpdate({ ...tarefa, status: 'pendente' })
              }
              className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
            >
              Reagendar
            </button>

            <button
              onClick={() =>
                onUpdate({ ...tarefa, status: 'cancelada' })
              }
              className="bg-gray-600 text-white px-2 py-1 rounded text-xs"
            >
              Cancelar
            </button>

            <button
              onClick={() => onDelete(tarefa.id)}
              className="bg-red-600 text-white px-2 py-1 rounded text-xs"
            >
              Excluir
            </button>
          </div>
        </div>
      ))}
    </aside>
  )
}