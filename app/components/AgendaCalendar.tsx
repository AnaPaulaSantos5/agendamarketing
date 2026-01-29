import React, { useState } from 'react';
import { AgendaEvent, Perfil, TarefaItem } from '../types';
import EventModal from './EventModal';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState({ start: '', end: '' });
  const [currentPerfil, setCurrentPerfil] = useState<Perfil>('Confi Finanças');

  const handleSave = (newEvent: AgendaEvent) => {
    setEvents([...events, newEvent]);
  };

  return (
    <div>
      <button
        onClick={() => setModalOpen(true)}
      >
        Adicionar Evento
      </button>

      <EventModal
        isOpen={modalOpen}
        start={selectedDate.start || new Date().toISOString()}
        end={selectedDate.end || new Date().toISOString()}
        perfil={currentPerfil}
        checklist={[]}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />

      <ul>
        {events.map(e => (
          <li key={e.id}>
            {e.conteudoPrincipal} ({e.perfil}) - {e.checklist.length} tarefas
          </li>
        ))}
      </ul>
    </div>
  );
}