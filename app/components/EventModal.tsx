import { useState } from 'react';
import { AgendaEvent, Perfil, TarefaItem } from '@/app/types';

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
  const [startTime, setStartTime] = useState(start.slice(11,16)); // 'HH:mm'
  const [endTime, setEndTime] = useState(end.slice(11,16));
  const [tarefas, setTarefas] = useState<TarefaItem[]>(checklist);

  if (!isOpen) return null;

  function save() {
    if (!conteudoPrincipal) return alert('Preencha o título do evento');

    onSave({
      id: Date.now().toString(),
      title: conteudoPrincipal,
      start: `${start.slice(0,10)}T${startTime}`,
      end: `${start.slice(0,10)}T${endTime}`,
      perfil,
      checklist: tarefas,
    });
    onClose();
  }

  function toggleTarefa(id: string) {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, feito: !t.feito } : t));
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Novo Evento</h2>
        <input
          type="text"
          placeholder="Título do evento"
          value={conteudoPrincipal}
          onChange={e => setConteudoPrincipal(e.target.value)}
        />
        <label>Início</label>
        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        <label>Fim</label>
        <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />

        <h3>Checklist</h3>
        {tarefas.map(t => (
          <div key={t.id}>
            <input type="checkbox" checked={t.feito} onChange={() => toggleTarefa(t.id)} />
            <span>{t.texto}</span>
          </div>
        ))}

        <button onClick={save}>Salvar</button>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}