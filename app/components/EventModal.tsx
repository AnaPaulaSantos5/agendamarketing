'use client';

import { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

interface Props {
  event: AgendaEvent | null;
  date: string | null;
  perfis: { nome: Perfil; chatId: string }[];
  onSave: (data: AgendaEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({ event, date, perfis, onSave, onDelete, onClose }: Props) {
  const [form, setForm] = useState<AgendaEvent>({
    id: '',
    title: '',
    start: date || '',
    end: date || '',
    conteudoSecundario: '',
    perfil: undefined,
    linkDrive: '',
  });

  useEffect(() => {
    if (event) setForm({ ...event });
    else setForm({ ...form, start: date || '', end: date || '' });
  }, [event, date]);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{event?.id ? 'Editar evento' : 'Novo evento'}</h2>

        <input
          className="w-full border p-2 rounded"
          placeholder="Título"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full border p-2 rounded mt-2"
          placeholder="Conteúdo secundário"
          value={form.conteudoSecundario}
          onChange={(e) => setForm({ ...form, conteudoSecundario: e.target.value })}
        />

        <select
          className="w-full border p-2 rounded mt-2"
          value={form.perfil || ''}
          onChange={(e) => setForm({ ...form, perfil: e.target.value as Perfil })}
        >
          <option value="">Selecione o perfil</option>
          {perfis.map((p) => (
            <option key={p.nome} value={p.nome}>
              {p.nome} (ChatID: {p.chatId})
            </option>
          ))}
        </select>

        <input
          type="text"
          className="w-full border p-2 rounded mt-2"
          placeholder="Link Drive"
          value={form.linkDrive || ''}
          onChange={(e) => setForm({ ...form, linkDrive: e.target.value })}
        />

        <input
          type="datetime-local"
          className="w-full border p-2 rounded mt-2"
          value={form.start}
          onChange={(e) => setForm({ ...form, start: e.target.value })}
        />

        <div className="flex justify-end mt-4">
          {event?.id && (
            <button
              className="mr-2 text-red-600"
              onClick={() => onDelete(event.id)}
            >
              Excluir
            </button>
          )}
          <button
            className="mr-2"
            onClick={() => onSave(form)}
          >
            Salvar
          </button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
