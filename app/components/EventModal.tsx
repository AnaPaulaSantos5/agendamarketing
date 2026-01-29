'use client';

import React, { useState } from 'react';
import { AgendaEvent } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  event: AgendaEvent;
  onClose: () => void;
  onSave: (ev: AgendaEvent) => void;
  onDelete: (id: string) => void;
};

export default function EventModal({
  isOpen,
  event,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [editMode, setEditMode] = useState(!event.id);
  const [local, setLocal] = useState<AgendaEvent>(event);

  if (!isOpen) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{editMode ? 'Editar Evento' : 'Detalhes do Evento'}</h3>

        {!editMode ? (
          <>
            <p><strong>Título:</strong> {local.title}</p>
            <p><strong>Data:</strong> {local.start}</p>
            <p><strong>Status:</strong> {local.status}</p>

            <button onClick={() => setEditMode(true)}>✏️ Editar</button>
          </>
        ) : (
          <>
            <input
              value={local.title}
              onChange={e =>
                setLocal({ ...local, title: e.target.value })
              }
              placeholder="Título"
            />

            <input
              type="datetime-local"
              value={local.start.slice(0, 16)}
              onChange={e =>
                setLocal({ ...local, start: e.target.value })
              }
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => onSave(local)}>Salvar</button>
              {local.id && (
                <button onClick={() => onDelete(local.id)}>
                  Excluir
                </button>
              )}
            </div>
          </>
        )}

        <button onClick={onClose} style={{ marginTop: 10 }}>
          Fechar
        </button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 360,
  borderRadius: 8,
};