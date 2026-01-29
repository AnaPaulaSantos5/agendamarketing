'use client';

import { useState } from 'react';
import { AgendaItem, ChecklistItem, Profile } from '@/lib/types';
import { v4 as uuid } from 'uuid';

type Props = {
  isOpen: boolean;
  start: string;
  end: string;
  onSave: (event: AgendaItem) => void;
  onClose: () => void;
};

export default function EventModal({
  isOpen,
  start,
  end,
  onSave,
  onClose,
}: Props) {
  if (!isOpen) return null;

  const date = start.split('T')[0];

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [conteudoPrincipal, setConteudoPrincipal] = useState('');
  const [perfil, setPerfil] = useState<Profile>('Confi');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  function addChecklist() {
    setChecklist([
      ...checklist,
      { id: uuid(), label: '', done: false },
    ]);
  }

  function save() {
    onSave({
      id: Date.now(),
      title: conteudoPrincipal || 'Evento',
      start: `${date}T${startTime}`,
      end: `${date}T${endTime}`,
      tipoEvento: 'Agenda',
      tipo: '',
      conteudoPrincipal,
      conteudoSecundario: '',
      cta: '',
      statusPostagem: 'Pendente',
      perfil,
      checklist,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-4 rounded w-96">
        <h2>Novo evento</h2>

        <input
          placeholder="Título"
          value={conteudoPrincipal}
          onChange={e => setConteudoPrincipal(e.target.value)}
        />

        <label>Início</label>
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />

        <label>Fim</label>
        <input
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
        />

        <select
          value={perfil}
          onChange={e => setPerfil(e.target.value as Profile)}
        >
          <option value="Confi">Confi</option>
          <option value="Luiza">Luiza</option>
          <option value="Cecilia">Cecília</option>
        </select>

        <h3>Checklist</h3>
        {checklist.map((item, i) => (
          <input
            key={item.id}
            placeholder="Item"
            value={item.label}
            onChange={e => {
              const copy = [...checklist];
              copy[i].label = e.target.value;
              setChecklist(copy);
            }}
          />
        ))}

        <button onClick={addChecklist}>+ Item</button>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={save}>Salvar</button>
        </div>
      </div>
    </div>
  );
}