import React, { useState } from 'react';
import { AgendaEvent, Perfil, TarefaItem } from '../types';

interface Props {
  isOpen: boolean;
  start: string;
  end: string;
  perfil: Perfil;
  checklist: TarefaItem[];
  onSave: (newEvent: AgendaEvent) => void;
  onClose: () => void;
}

export default function EventModal({ isOpen, start, end, perfil, checklist, onSave, onClose }: Props) {
  const [conteudoPrincipal, setConteudoPrincipal] = useState('');
  const [tarefas, setTarefas] = useState<TarefaItem[]>(checklist);

  const handleAddTarefa = () => {
    const novaTarefa: TarefaItem = {
      id: Date.now().toString(),
      texto: '',
      feito: false,
      status: 'Pendente'
    };
    setTarefas([...tarefas, novaTarefa]);
  };

  const handleSave = () => {
    onSave({
      id: Date.now().toString(),
      conteudoPrincipal,
      perfil,
      checklist: tarefas,
      start,
      end,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>Adicionar Evento</h2>
      <input
        type="text"
        placeholder="Conteúdo Principal"
        value={conteudoPrincipal}
        onChange={e => setConteudoPrincipal(e.target.value)}
      />

      <ul>
        {tarefas.map((t, idx) => (
          <li key={t.id}>
            <input
              type="text"
              value={t.texto}
              onChange={e => {
                const newTarefas = [...tarefas];
                newTarefas[idx].texto = e.target.value;
                setTarefas(newTarefas);
              }}
            />
          </li>
        ))}
      </ul>
      <button onClick={handleAddTarefa}>Adicionar Checklist</button>
      <button onClick={handleSave}>Salvar</button>
      <button onClick={onClose}>Fechar</button>
    </div>
  );
}