import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';
import { AgendaEvent, Perfil, TarefaItem } from '@/lib/types';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [selectedPerfil, setSelectedPerfil] = useState<Perfil>('Confi');
  const [selectedChecklist, setSelectedChecklist] = useState<TarefaItem[]>([]);

  const handleDateClick = (arg: any) => {
    setSelectedDate({ start: arg.dateStr, end: arg.dateStr });
    setSelectedPerfil('Confi');         // perfil default
    setSelectedChecklist([]);           // checklist default
    setModalOpen(true);
  };

  const handleSave = (newEvent: AgendaEvent) => {
    setEvents([...events, newEvent]);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events.map(ev => ({
          title: ev.title,
          start: ev.start,
          end: ev.end,
        }))}
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