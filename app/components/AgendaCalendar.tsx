'use client';

import { useEffect, useState } from 'react';
import { AgendaEvent, ChecklistItem } from '../types';
import EventModal from './EventModal';
import { mapPlanilhaParaEventos } from '../../utils';

interface AgendaCalendarProps {
  sheetData: any[]; // dados da planilha
}

const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ sheetData }) => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [modalEvent, setModalEvent] = useState<AgendaEvent | null>(null);

  useEffect(() => {
    // mapeia todos os dados da planilha para eventos
    const mappedEvents = mapPlanilhaParaEventos(sheetData);
    setEvents(mappedEvents);

    // filtra checklist do dia
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = mappedEvents
      .map(ev => ev.tarefa)
      .filter(t => t && !t.status)
      .map((t, idx) => ({
        id: t?.titulo + idx,
        date: today,
        client: t?.responsavel || '',
        task: t?.titulo || '',
        done: false
      })) as ChecklistItem[];

    setChecklist(todayTasks);
  }, [sheetData]);

  const concluirTarefa = async (id: string) => {
    // remove instantaneamente da tela
    setChecklist(prev => prev.filter(c => c.id !== id));

    // Atualiza na planilha via API
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
      {/* Checklist lateral */}
      <div style={{ padding: 10, minWidth: 250 }}>
        <h3>Checklist Hoje</h3>
        {checklist.length === 0 && <p>Sem tarefas para hoje ✅</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {checklist.map(item => (
            <li key={item.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>
                {item.task} ({item.client}) - {item.done ? 'Concluído' : 'Pendente'}
              </span>
              <button style={{ marginLeft: 8 }} onClick={() => concluirTarefa(item.id)}>✅</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Calendário */}
      <div style={{ flex: 1 }}>
        <h3>Eventos</h3>
        <ul>
          {events.map(ev => (
            <li key={ev.id} style={{ marginBottom: 10 }}>
              <strong>{ev.tipoEvento}</strong>: {ev.conteudoPrincipal || ev.tarefa?.titulo}
              <br />
              <small>{ev.dateStart} - {ev.dateEnd} | {ev.perfil}</small>
              <br />
              <button onClick={() => setModalEvent(ev)}>Editar/Ver</button>
            </li>
          ))}
        </ul>
      </div>

      {modalEvent && (
        <EventModal event={modalEvent} onClose={() => setModalEvent(null)} />
      )}
    </div>
  );
};

export default AgendaCalendar;