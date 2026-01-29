import { useEffect, useState } from 'react';
import { AgendaEvent } from '../types';
import { mapPlanilhaParaEventos } from '../utils';
import EventModal from './EventModal';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<AgendaEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/getPlanilha');
        const data = await res.json();
        const allEvents = mapPlanilhaParaEventos(data);
        setEvents(allEvents);

        const today = new Date().toISOString().slice(0, 10);
        setChecklist(
          allEvents.filter(
            e => e.dateStart.slice(0, 10) === today && e.tarefa && e.tarefa.status !== 'Concluído'
          )
        );
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Calendário (lista simples) */}
      <div style={{ flex: 3 }}>
        <h2>Agenda</h2>
        <ul>
          {events.map(event => (
            <li key={event.id} style={{ marginBottom: 10 }}>
              <b>{event.tipoEvento}</b> ({event.perfil})
              <div>{event.conteudoPrincipal}</div>
              <div>{event.conteudoSecundario}</div>
              {event.tarefa && <div>Tarefa: {event.tarefa.titulo}</div>}
              <button onClick={() => setSelectedEvent(event)}>Editar</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Checklist lateral */}
      <div style={{ flex: 1, padding: 10, border: '1px solid #ccc' }}>
        <h3>Checklist Hoje</h3>
        {checklist.length === 0 && <p>Sem tarefas para hoje ✅</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {checklist.map(item => (
            <li key={item.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>
                {item.tarefa?.titulo} ({item.perfil}) - {item.tarefa?.status || 'Pendente'}
              </span>
              <button
                style={{ marginLeft: 8 }}
                onClick={async () => {
                  setChecklist(prev => prev.filter(c => c.id !== item.id));
                  try {
                    await fetch('/api/checklist', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: item.id, status: 'Concluído' })
                    });
                  } catch (err) {
                    console.error(err);
                    alert('Erro ao concluir tarefa');
                  }
                }}
              >
                ✅
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de edição */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}