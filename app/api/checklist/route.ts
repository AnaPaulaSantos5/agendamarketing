'use client';
import { ChecklistItem } from '../types';

interface ChecklistProps {
  tasks: ChecklistItem[];
  onConclude: (id: string) => void;
}

export default function Checklist({ tasks, onConclude }: ChecklistProps) {
  return (
    <div style={{ padding: 10 }}>
      <h3>Checklist Hoje</h3>
      {tasks.length === 0 && <p>Sem tarefas para hoje ✅</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(item => (
          <li key={item.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
            <span style={{ flex: 1 }}>
              {item.task} ({item.client}) - {item.done ? 'Concluído' : 'Pendente'}
            </span>
            <button style={{ marginLeft: 8 }} onClick={() => onConclude(item.id)}>✅</button>
          </li>
        ))}
      </ul>
    </div>
  );
}