'use client';

import { useState } from 'react';
import { AgendaEvent, Perfil } from './types';

interface Props {
  event: AgendaEvent | null;
  start: string;
  end: string;
  perfil: Perfil;
  onSave: (e: AgendaEvent, edit?: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({
  event,
  start,
  end,
  perfil,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [titulo, setTitulo] = useState(event?.conteudoPrincipal || '');

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0006' }}>
      <div style={{ background: '#fff', padding: 20, margin: '10% auto', width: 320 }}>
        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Título"
          style={{ width: '100%' }}
        />

        <button
          onClick={() =>
            onSave(
              {
                id: event?.id || '',
                start,
                end,
                conteudoPrincipal: titulo,
                perfil,
              } as AgendaEvent,
              !!event
            )
          }
        >
          Salvar
        </button>

        {event && <button onClick={() => onDelete(event.id)}>Excluir</button>}
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}