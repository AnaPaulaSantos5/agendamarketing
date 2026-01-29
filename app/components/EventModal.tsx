'use client'
import { useState } from 'react'
import { AgendaEvent } from '../types/AgendaEvent'

type Props = {
  isOpen: boolean
  event: AgendaEvent | null
  onClose: () => void
  onSave: (event: AgendaEvent) => void
  onDelete: (id: string) => void
}

export default function EventModal({
  isOpen,
  event,
  onClose,
  onSave,
  onDelete
}: Props) {
  const [editMode, setEditMode] = useState(false)
  const [localEvent, setLocalEvent] = useState<AgendaEvent | null>(event)

  if (!isOpen || !event) return null

  const handleChange = (field: keyof AgendaEvent, value: any) => {
    setLocalEvent(prev => prev ? { ...prev, [field]: value } : prev)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded p-4">
        {!editMode ? (
          <>
            <h2 className="font-semibold text-lg mb-2">{event.title}</h2>
            <p className="text-sm">Data: {event.date}</p>
            <p className="text-sm">Status: {event.status}</p>
            <p className="text-sm">Perfil: {event.perfil}</p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Editar
              </button>

              <button
                onClick={() => onDelete(event.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Excluir
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              className="border w-full p-2 mb-2"
              value={localEvent?.title || ''}
              onChange={e => handleChange('title', e.target.value)}
            />

            <input
              type="date"
              className="border w-full p-2 mb-2"
              value={localEvent?.date || ''}
              onChange={e => handleChange('date', e.target.value)}
            />

            <select
              className="border w-full p-2 mb-2"
              value={localEvent?.status}
              onChange={e => handleChange('status', e.target.value)}
            >
              <option value="pendente">Pendente</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  if (localEvent) onSave(localEvent)
                  setEditMode(false)
                }}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Salvar
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="border px-3 py-1 rounded"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}