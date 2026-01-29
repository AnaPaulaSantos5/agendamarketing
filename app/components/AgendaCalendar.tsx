'use client';

import { useEffect, useState } from 'react';
import { AgendaEvent, ChecklistItem, mapPlanilhaParaEventos } from '../utils';

interface AgendaCalendarProps {
  sheetData: any[];
}

export default function AgendaCalendar({ sheetData }: AgendaCalendarProps) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    const mapped = mapPlanilhaParaEventos(sheetData);
    setEvents(mapped);

    // Preenche checklist do dia
    const today = new Date().toISOString().slice(0, 10);
    const todayChecklist: ChecklistItem[] = mapped
      .filter(e => e.tarefa && e.dateStart.slice(0, 10) === today && e.tarefa.status !== 'Concluído')
      .map(e => ({
        id: e.id,
        date: e.dateStart,
        client: e.perfil,
        task: e.tarefa!.titulo,
        done: false
      }));
    setChecklist(todayChecklist);
  }, [sheetData]);

  const concluirTarefa = async (id: string) => {
    // Atualiza instantaneamente na tela
    setChecklist(prev => prev.filter(c => c.id !== id));

    // Aqui você pode atualizar na planilha via API
    try {
      await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao concluir tarefa');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Agenda principal */}
      <div style={{ flex: 3 }}>
        <h2>Agenda</h2>
        {events.map(e => (
          <div key={e.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
            <strong>{e.tipoEvento}</strong> - {e.dateStart}
            {e.dateEnd && <> até {e.dateEnd}</>}
            <div>{e.conteudoPrincipal}</div>
            <div>{e.conteudoSecundario}</div>
            {e.tarefa && (
              <div>
                Tarefa: {e.tarefa.titulo} - Status: {e.tarefa.status} - Perfil: {e.perfil}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Checklist lateral */}
      <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: 10 }}>
        <h3>Checklist Hoje</h3>
        {checklist.length === 0 && <p>Sem tarefas para hoje ✅</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {checklist.map(item => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ flex: 1 }}>
                {item.task} ({item.client})
              </span>
              <button onClick={() => concluirTarefa(item.id)}>✅</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}