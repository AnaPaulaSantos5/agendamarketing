'use client';
import { useEffect, useState } from 'react';
import { AgendaEvent } from './AgendaCalendar';

interface Props {
  event: AgendaEvent | null;
  date: string | null;
  perfis: { nome: string; chatId: string }[];
  onSave: (data: AgendaEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({ event, date, perfis, onSave, onDelete, onClose }: Props) {
  const [form, setForm] = useState<AgendaEvent>({
    id: '',
    start: date || '',
    conteudoPrincipal: '',
    conteudoSecundario: '',
    perfil: undefined,
  });

  useEffect(() => {
    if (event) setForm(event);
    else if (date)
      setForm({
        id: '',
        start: date,
        conteudoPrincipal: '',
        conteudoSecundario: '',
        perfil: undefined,
      });
  }, [event, date]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded p-4 w-96 space-y-3">
        <h2 className="font-bold">{event ? 'Editar evento' : 'Novo evento'}</h2>

        {/* Título */}
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Título"
          value={form.conteudoPrincipal}
          onChange={e => setForm({ ...form, conteudoPrincipal: e.target.value })}
        />

        {/* Conteúdo secundário */}
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Conteúdo secundário"
          value={form.conteudoSecundario || ''}
          onChange={e => setForm({ ...form, conteudoSecundario: e.target.value })}
        />

        {/* Perfil */}
        <select
          className="w-full border p-2 rounded"
          value={form.perfil}
          onChange={e => setForm({ ...form, perfil: e.target.value as any })}
        >
          <option value="">Selecione o perfil</option>
          {perfis.map(p => (
            <option key={p.nome} value={p.nome}>
              {p.nome} - ChatID: {p.chatId}
            </option>
          ))}
        </select>

        {/* Link Drive */}
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Link Drive"
          value={form.linkDrive || ''}
          onChange={e => setForm({ ...form, linkDrive: e.target.value })}
        />

        {/* Data/Hora */}
        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={form.start}
          onChange={e => setForm({ ...form, start: e.target.value })}
        />

        <div className="flex justify-end space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded"
            onClick={() => onSave(form)}
          >
            Salvar
          </button>
          {event && (
            <button
              className="bg-red-500 text-white px-4 py-1 rounded"
              onClick={() => onDelete(event.id)}
            >
              Excluir
            </button>
          )}
          <button
            className="bg-gray-300 px-4 py-1 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
