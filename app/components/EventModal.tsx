'use client';

import { useEffect, useState } from 'react';
import { AgendaEvent } from './AgendaCalendar';

interface Props {
  isOpen: boolean;
  event: AgendaEvent | null;
  isAdmin: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function EventModal({
  isOpen,
  event,
  isAdmin,
  onClose,
  onSaved
}: Props) {
  const [form, setForm] = useState<AgendaEvent | null>(null);

  useEffect(() => {
    if (event) {
      setForm({
        ...event,
        tarefa: {
          responsavelChatId: event.tarefa?.responsavelChatId || '',
          titulo: event.tarefa?.titulo || '',
          linkDrive: event.tarefa?.linkDrive || ''
        }
      });
    }
  }, [event]);

  if (!isOpen || !form) return null;

  function updateField(path: string, value: string) {
    setForm(prev => {
      if (!prev) return prev;
      const copy = structuredClone(prev);
      if (path.startsWith('tarefa.')) {
        const key = path.replace('tarefa.', '') as keyof typeof copy.tarefa;
        copy.tarefa![key] = value;
      } else {
        (copy as any)[path] = value;
      }
      return copy;
    });
  }

  async function save() {
    await fetch('/api/agenda', {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onSaved();
    onClose();
  }

  return (
    <div className="modal">
      <h3>{form.id ? 'Editar evento' : 'Novo evento'}</h3>

      <input
        placeholder="Conteúdo principal"
        value={form.conteudoPrincipal || ''}
        onChange={e => updateField('conteudoPrincipal', e.target.value)}
      />

      <select
        value={form.perfil}
        onChange={e => updateField('perfil', e.target.value)}
      >
        <option value="Confi Seguros">Confi Seguros</option>
        <option value="Confi Finanças">Confi Finanças</option>
        <option value="Confi Benefícios">Confi Benefícios</option>
      </select>

      {isAdmin && (
        <input
          placeholder="Chat ID responsável"
          value={form.tarefa?.responsavelChatId || ''}
          onChange={e =>
            updateField('tarefa.responsavelChatId', e.target.value)
          }
        />
      )}

      <input
        placeholder="Título da tarefa"
        value={form.tarefa?.titulo || ''}
        onChange={e => updateField('tarefa.titulo', e.target.value)}
      />

      <input
        placeholder="Link Drive"
        value={form.tarefa?.linkDrive || ''}
        onChange={e => updateField('tarefa.linkDrive', e.target.value)}
      />

      <input
        type="date"
        value={form.start}
        onChange={e => updateField('start', e.target.value)}
      />

      <button onClick={save}>Salvar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
