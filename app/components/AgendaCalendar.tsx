'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Props {
  events: any[];
  onSelectDate: (dateStr: string) => void;
  onEventClick: (event: any) => void;
}

export default function AgendaCalendar({
  events,
  onSelectDate,
  onEventClick,
}: Props) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      selectable
      events={events}
      dateClick={info => onSelectDate(info.dateStr)}
      eventClick={info =>
        onEventClick({
          id: info.event.id,
          title: info.event.title,
          start: info.event.startStr,
          end: info.event.endStr,
          perfil: info.event.extendedProps.perfil,
        })
      }
      height="auto"
    />
  );
}
