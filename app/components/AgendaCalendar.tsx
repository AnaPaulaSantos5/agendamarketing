'use client';

import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { AgendaEvent, Perfil, TarefaItem } from '@/app/types';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedPerfil, setSelectedPerfil] = useState<Perfil>('Confi');
  const [selectedChecklist, setSelectedChecklist] = useState<TarefaItem[]>([]);

  const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

  function handleDateClick(info: any) {
    setSelectedDate({ start: info.dateStr, end: info.dateStr });
    setSelectedPerfil('Confi');
    setSelectedChecklist([]);
    setModalOpen(true);
  }

  function handleSave(newEvent: AgendaEvent) {
    setEvents(prev => [...prev, newEvent]);
    setModalOpen(false);
  }

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
      />

      <EventModal
        isOpen={modalOpen}
        start={selectedDate.start}
        end={selectedDate.end}
        perfil={selectedPerfil}
        checklist={selectedChecklist}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}