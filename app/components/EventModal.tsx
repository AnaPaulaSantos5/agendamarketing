'use client';
import { useEffect, useState } from 'react';
import { AgendaEvent, Tarefa, Perfil } from './AgendaCalendar';

interface Props {
  event: AgendaEvent | null;
  date: string;
  perfis: { nome: Perfil; chatId: string }[];
  isAdmin?: boolean;
  onSave: (data: AgendaEvent, isEdit?: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({
  event,
  date,
  perfis,
  isAdmin = false,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [form, setForm] = useState({
    id: '',
    conteudoPrincipal: '',
    conteudoSecundario: '',
    start: date,
    end: date,
    perfil: perfis[0]?.nome || 'Confi',
    tarefa: {
      titulo: '',
      responsavel: perfis[0]?.nome || 'Confi',
      responsavelChatId: perfis[0]?.chatId || '',
      data: date,
      status: 'Pendente',
      linkDrive: '',
      notificar: 'Sim',
    } as Tarefa,
  });

  useEffect(() => {
    if (event) {
      setForm({
        id: event.id,
        conteudoPrincipal: event.conteudoPrincipal || '',
        conteudoSecundario: event.conteudoSecundario || '',
        start: event.start,
        end: event.end || event.start,
        perfil: event.perfil || 'Confi',
        tarefa: {
          ...form.tarefa,
          ...event.tarefa,
          responsavelChatId: event.tarefa?.responsavelChatId || '',
        },
      });
    } else {
      setForm((prev) => ({ ...prev, start: date, end: date }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, date]);

  const handleSave = () => {
    onSave(form, !!event);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">{event ? 'Editar Evento' : 'Novo Evento'}</h2>

        <label className="block mb-1">Título</label>
        <input
          className="w-full border p-1 mb-2 rounded"
          value={form.conteudoPrincipal}
          onChange={(e) => setForm({ ...form, conteudoPrincipal: e.target.value })}
        />

        <label className="block mb-1">Conteúdo Secundário</label>
        <input
          className="w-full border p-1 mb-2 rounded"
          value={form.conteudoSecundario}
          onChange={(e) => setForm({ ...form, conteudoSecundario: e.target.value })}
        />

        <label className="block mb-1">Perfil</label>
        <select
          className="w-full border p-1 mb-2 rounded"
          value={form.perfil}
          onChange={(e) => {
            const selectedPerfil = e.target.value as Perfil;
            const chatId = perfis.find((p) => p.nome === selectedPerfil)?.chatId || '';
            setForm({
              ...form,
              perfil: selectedPerfil,
              tarefa: { ...form.tarefa, responsavel: selectedPerfil, responsavelChatId: chatId },
            });
          }}
        >
          {perfis.map((p) => (
            <option key={p.nome} value={p.nome}>
              {p.nome} - {p.chatId}
            </option>
          ))}
        </select>

        <label className="block mb-1">Data e Hora</label>
        <input
          type="datetime-local"
          className="w-full border p-1 mb-2 rounded"
          value={form.start}
          onChange={(e) => setForm({ ...form, start: e.target.value })}
        />

        <label className="block mb-1">Link do Drive</label>
        <input
          type="text"
          className="w-full border p-1 mb-2 rounded"
          value={form.tarefa.linkDrive}
          onChange={(e) =>
            setForm({ ...form, tarefa: { ...form.tarefa, linkDrive: e.target.value } })
          }
        />

        <div className="flex justify-end mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            onClick={handleSave}
          >
            Salvar
          </button>
          {event && (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded mr-2"
              onClick={() => onDelete(event.id)}
            >
              Excluir
            </button>
          )}
          <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
