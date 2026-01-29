'use client'

import { AgendaItem } from '../types'

type Props = {
  item: AgendaItem
  onSave: (item: AgendaItem) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function EventModal({ item, onSave, onDelete, onClose }: Props) {
  function update(field: keyof AgendaItem, value: any) {
    onSave({ ...item, [field]: value })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 w-[400px] space-y-2">
        <h2 className="font-bold">Evento</h2>

        <input type="datetime-local" value={item.dataInicio}
          onChange={e => update('dataInicio', e.target.value)} />

        <input type="datetime-local" value={item.dataFim}
          onChange={e => update('dataFim', e.target.value)} />

        <input placeholder="Tipo Evento"
          value={item.tipoEvento}
          onChange={e => update('tipoEvento', e.target.value)} />

        <input placeholder="Conteúdo Principal"
          value={item.conteudoPrincipal}
          onChange={e => update('conteudoPrincipal', e.target.value)} />

        <input placeholder="CTA"
          value={item.cta}
          onChange={e => update('cta', e.target.value)} />

        <input placeholder="Perfil"
          value={item.perfil}
          onChange={e => update('perfil', e.target.value)} />

        <input placeholder="Link Drive"
          value={item.linkDrive}
          onChange={e => update('linkDrive', e.target.value)} />

        <div className="flex gap-2">
          <button onClick={() => onSave(item)}>Salvar</button>
          <button onClick={() => onDelete(item.id)}>Excluir</button>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}