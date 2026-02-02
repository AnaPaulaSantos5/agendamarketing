'use client';

import { useEffect, useState } from 'react';

interface Props {
  event: any | null;
  date: string | null;
  perfis: { nome: string; chatId: string }[];
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({
  event,
  date,
  perfis,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [perfil, setPerfil] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStart(event.start);
      setPerfil(event.perfil || '');
    } else if (date) {
      setTitle('');
      setStart(date);
      setPerfil('');
    }
  }, [event, date]);

  return (
    <div className="modal">
      <h3>{event ? 'Editar evento' : 'Novo evento'}</h3>

      <input
        placeholder="Título"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <input
        type="datetime-local"
        value={start}
        onChange={e => setStart(e.target.value)}
      />

      <select value={perfil} onChange={e => setPerfil(e.target.value)}>
        <option value="">Selecione o perfil</option>
        {perfis.map(p => (
          <option key={p.nome} value={p.nome}>
            {p.nome}
          </option>
        ))}
      </select>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={() =>
            onSave({
              id: event?.id,
              title,
              start,
              perfil,
            })
          }
        >
          Salvar
        </button>

        {event && (
          <button
            style={{ marginLeft: 8, color: 'red' }}
            onClick={() => onDelete(event.id)}
          >
            Excluir
          </button>
        )}

        <button style={{ marginLeft: 8 }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
