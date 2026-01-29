'use client';
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type ChecklistItem = {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
};

export default function AgendaCalendar() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filterProfile, setFilterProfile] = useState('Confi');
  const today = new Date().toISOString().slice(0, 10);

  // Carrega checklist
  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const res = await fetch('/api/checklist');
      const data = await res.json();
      // Remove duplicações e pega apenas do dia
      const todayTasks = Array.from(new Map(data.map((t: ChecklistItem) => [t.id, t])).values())
        .filter((t: ChecklistItem) => t.date.slice(0, 10) === today && !t.done);
      setChecklist(todayTasks);
    } catch (err) {
      console.error(err);
    }
  };

  // Marca como concluído
  const toggleChecklistItem = async (item: ChecklistItem) => {
    // Remove instantaneamente
    setChecklist(prev => prev.filter(c => c.id !== item.id));

    try {
      await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar checklist');
    }
  };

  return (
    <div style={{ width: 300 }}>
      <h3>Checklist Hoje</h3>
      {checklist.length === 0 && <p>Nenhuma tarefa hoje!</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {checklist.map(item => (
          <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>{item.task} ({item.client})</span>
            <button onClick={() => toggleChecklistItem(item)}>✅</button>
          </li>
        ))}
      </ul>
    </div>
  );
}