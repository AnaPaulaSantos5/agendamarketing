// app/components/AgendaCalendar.tsx
'use client';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function AgendaCalendar({ onEventClick }: { onEventClick: (event: any) => void }) {
  const events = [
    { id: '1', title: 'Reunião', start: new Date().toISOString() },
    { id: '2', title: 'Call Cliente', start: new Date().toISOString() },
  ];

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      events={events}
      selectable
      eventClick={(info) => onEventClick(info.event)}
      height="auto"
    />
  );
}