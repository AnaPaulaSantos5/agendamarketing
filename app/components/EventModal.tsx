'use client'

import { AgendaItem, Perfil } from '../types/agenda'
import { useState } from 'react'

type Props = {
  item: AgendaItem
  onSave: (item: AgendaItem) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function EventModal({
  item,
  onSave,
  onDelete,
  onClose
}: Props) {
  const [data, setData] = useState<AgendaItem>(item)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', padding: 20, width: 420 }}>
        <h3>{item.title || 'Novo item'}</h3>

        <input
          placeholder="Título"
          value={data.title}
          onChange={e => setData({ ...data, title: e.target.value })}
        />

        <select
          value={data.category}
          onChange={e => setData({ ...data, category: e.target.value as any })}
        >
          <option value="evento">Evento</option>
          <option value="tarefa">Tarefa</option>
        </select>

        <select
          value={data.visibility}
          onChange={e => setData({ ...data, visibility: e.target.value as any })}
        >
          <option value="interno">Interno</option>
          <option value="perfil">Perfil</option>
        </select>

        {data.visibility === 'perfil' && (
          <select
            value={data.perfil}
            onChange={e =>
              setData({ ...data, perfil: e.target.value as Perfil })
            }
          >
            <option value="Confi">Confi</option>
            <option value="Luiza">Luiza</option>
            <option value="Cecília">Cecília</option>
            <option value="Júlio">Júlio</option>
          </select>
        )}

        <textarea
          placeholder="Conteúdo principal"
          value={data.conteudoPrincipal || ''}
          onChange={e =>
            setData({ ...data, conteudoPrincipal: e.target.value })
          }
        />

        <textarea
          placeholder="Conteúdo secundário"
          value={data.conteudoSecundario || ''}
          onChange={e =>
            setData({ ...data, conteudoSecundario: e.target.value })
          }
        />

        <input
          placeholder="Link do Drive"
          value={data.linkDrive || ''}
          onChange={e =>
            setData({ ...data, linkDrive: e.target.value })
          }
        />

        <div style={{ marginTop: 12 }}>
          <button onClick={() => onSave(data)}>Salvar</button>
          <button onClick={() => onDelete(data.id)}>Excluir</button>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}