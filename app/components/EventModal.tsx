'use client'

import { AgendaEvent } from '@/app/types'

type Props = {
  event: AgendaEvent
  onClose: () => void
  onSave: (ev: AgendaEvent) => void
  onDelete: (id: string) => void
}

export default function EventModal({
  event,
  onClose,
  onSave,
  onDelete,
}: Props) {
  function update<K extends keyof AgendaEvent>(key: K, value: AgendaEvent[K]) {
    onSave({ ...event, [key]: value })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] rounded-lg p-4 space-y-3">
        <h2 className="font-bold text-lg">
          {event.id ? 'Editar' : 'Novo'} {event.tipo}
        </h2>

        <input
          className="w-full border p-2"
          value={event.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Título"
        />

        <input
          type="date"
          className="w-full border p-2"
          value={event.date}
          onChange={(e) => update('date', e.target.value)}
        />

        <select
          className="w-full border p-2"
          value={event.status}
          onChange={(e) =>
            update('status', e.target.value as AgendaEvent['status'])
          }
        >
          <option value="pendente">Pendente</option>
          <option value="concluida">Concluída</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <select
          className="w-full border p-2"
          value={event.perfil}
          onChange={(e) =>
            update('perfil', e.target.value as AgendaEvent['perfil'])
          }
        >
          <option value="Confi">Confi</option>
          <option value="Luiza">Luiza</option>
          <option value="Cecília">Cecília</option>
          <option value="Júlio">Júlio</option>
        </select>

        <div className="flex justify-between pt-3">
          <button
            className="text-red-600"
            onClick={() => onDelete(event.id)}
          >
            Excluir
          </button>

          <div className="space-x-2">
            <button onClick={onClose}>Cancelar</button>
            <button
              className="bg-black text-white px-3 py-1 rounded"
              onClick={onClose}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}