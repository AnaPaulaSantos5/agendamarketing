'use client';

import { useState } from 'react';
import { AgendaEvent } from '@/lib/types';
import { v4 as uuid } from 'uuid';

type Props = {
  isOpen: boolean;
  start: string;
  end: string;
  onSave: (event: AgendaEvent) => void;
  onClose: () => void;
};

export default function EventModal({
  isOpen,
  start,
  end,
  onSave,
  onClose,
}: Props) {
  const date = start.split('T')[0];

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [conteudoPrincipal, setConteudoPrincipal] = useState('');
  const [perfil, setPerfil] = useState('Confi');
  const [checklist, setChecklist] = useState<string[]>([]);
  const [checkItem, setCheckItem] = useState('');

  if (!isOpen) return null;

  function addChecklist() {
    if (!checkItem) return;
    setChecklist([...checklist, checkItem]);
    setCheckItem('');
  }

  function save() {
    onSave({
      id: uuid(),
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-4 w-[320px] rounded">
        <h2 className="font-bold mb-2">Novo Evento</h2>

        <input
          className="border w-full mb-2 p-1"
          placeholder="Conteúdo principal"
          value={conteudoPrincipal}
          onChange={(e) => setConteudoPrincipal(e.target.value)}
        />

        <div className="flex gap-2 mb-2">
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>

        <select
          className="border w-full mb-2 p-1"
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
        >
          <option>Confi</option>
          <option>Confi Finanças</option>
          <option>Confi Benefícios</option>
        </select>

        <div className="flex gap-2 mb-2">
          <input
            className="border flex-1 p-1"
            placeholder="Checklist"
            value={checkItem}
            onChange={(e) => setCheckItem(e.target.value)}
          />
          <button onClick={addChecklist}>+</button>
        </div>

        <ul className="mb-2 text-sm">
          {checklist.map((c, i) => (
            <li key={i}>• {c}</li>
          ))}
        </ul>

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={save} className="font-bold">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}