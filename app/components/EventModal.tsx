import React, { useState } from 'react';
import { AgendaEvent, Perfil, TarefaItem } from '../types';

type Props = {
  isOpen: boolean;
  start: string;
  end: string;
  perfil: Perfil;
  checklist: TarefaItem[];
  onSave: (event: AgendaEvent) => void;
  onClose: () => void;
};

export default function EventModal({ isOpen, start, end, perfil, checklist, onSave, onClose }: Props) {
  const [conteudoPrincipal, setConteudoPrincipal] = useState('');

  const [tarefas, setTarefas] = useState<TarefaItem[]>(checklist || []);

  const handleAddTarefa = () => {
    const novaTarefa: TarefaItem = {
      id: Date.now().toString(),
      texto: '',
      feito: false,
    };
    setTarefas([...tarefas, novaTarefa]);
  };

  const handleSave = () => {
    onSave({
      id: Date.now().toString(),
      title: conteudoPrincipal,
      start,
      end,
      perfil,
      checklist: tarefas,
    });
    setConteudoPrincipal('');
    setTarefas([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Novo Evento</h2>
        <input
          type="text"
          placeholder="Título do evento"
          value={conteudoPrincipal}
          onChange={(e) => setConteudoPrincipal(e.target.value)}
        />
        <div className="checklist">
          {tarefas.map((tarefa, idx) => (
            <input
              key={tarefa.id}
              type="text"
              value={tarefa.texto}
              onChange={(e) => {
                const updated = [...tarefas];
                updated[idx].texto = e.target.value;
                setTarefas(updated);
              }}
            />
          ))}
        </div>
        <button onClick={handleAddTarefa}>Adicionar Tarefa</button>
        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}