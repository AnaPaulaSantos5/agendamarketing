'use client';

import { useState } from 'react';
import { TarefaItem } from '../types';

export default function Tarefas() {
  const [tarefas, setTarefas] = useState<TarefaItem[]>([
    { id: '1', texto: 'Criar reunião', status: 'Pendente', responsavel: 'Ana' },
    { id: '2', texto: 'Enviar relatório', status: 'Concluído', responsavel: 'João' },
  ]);

  return (
    <div>
      <h2>Checklist de Tarefas</h2>
      <ul>
        {tarefas.map(t => (
          <li key={t.id}>
            {t.texto} - {t.status} ({t.responsavel})
          </li>
        ))}
      </ul>
    </div>
  );
}