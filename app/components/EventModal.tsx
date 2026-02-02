'use client';

import { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

interface Props {
  event: AgendaEvent | null;
  date: string | null;
  perfis: Perfil[];
  onSave: (data: AgendaEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({ event, date, perfis, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [perfil, setPerfil] = useState('');
  const [driveLink, setDriveLink] = useState('');

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStart(event.start);
      setPerfil(event.perfil || '');
      setDriveLink(event.driveLink || '');
    } else if (date) {
      setTitle('');
      setStart(date);
      setPerfil('');
      setDriveLink('');
    }
  }, [event, date]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{event ? 'Editar evento' : 'Novo evento'}</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Título"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          type="datetime-local"
          className="w-full border p-2 rounded mt-2"
          value={start}
          onChange={e => setStart(e.target.value)}
        />

        <select
          className="w-full border p-2 rounded mt-2"
          value={perfil}
          onChange={e => setPerfil(e.target.value)}
        >
          <option value="">Selecione o perfil</option>
          {perfis.map(p => (
            <option key={p.chatId} value={p.chatId}>
              {p.nome}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Link do Drive"
          className="w-full border p-2 rounded mt-2"
          value={driveLink}
          onChange={e => setDriveLink(e.target.value)}
        />

        <div className="mt-4 flex justify-end">
          {event && (
            <button
              className="mr-2 text-red-600"
              onClick={() => onDelete(event.id)}
            >
              Excluir
            </button>
          )}

          <button
            className="mr-2 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() =>
              onSave({
                id: event?.id || '',
                title,
                start,
                perfil,
                driveLink,
              })
            }
          >
            Salvar
          </button>

          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
