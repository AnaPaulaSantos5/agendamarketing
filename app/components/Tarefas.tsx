'use client';
import { useState, useEffect } from 'react';
import { TarefaItem } from '../lib/types';

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<TarefaItem[]>([]);

  useEffect(() => {
    async function fetchTarefas() {
      try {
        const res = await fetch('/api/tarefas');
        const data: TarefaItem[] = await res.json();
        setTarefas(data || []);
      } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
      }
    }
    fetchTarefas();
  }, []);

  return (
    <div>
      <h3>Checklist de Tarefas</h3>
      <ul>
        {tarefas.map(t => (
          <li key={t.titulo}>
            {t.titulo} - {t.status} ({t.responsavel})
          </li>
        ))}
      </ul>
    </div>
  );
}