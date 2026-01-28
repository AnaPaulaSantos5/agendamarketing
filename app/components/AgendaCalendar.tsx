'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { DateSelectArg, EventInput, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Profile = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

const profiles: Profile[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [filterProfile, setFilterProfile] = useState<Profile>('Confi');

  /**
   * 🔹 CRIAR EVENTO AO SELECIONAR DATA/HORÁRIO
   */
  function handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Digite a tarefa / conteúdo:');

    if (!title) {
      selectInfo.view.calendar.unselect();
      return;
    }

    const newEvent: EventInput = {
      id: String(Date.now()),
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      extendedProps: {
        profile: filterProfile,
        status: 'Pendente',
        linkDrive: '',
      },
    };

    setEvents(prev => [...prev, newEvent]);
  }

  /**
   * 🔹 CLICAR NO EVENTO
   */
  function handleEventClick(clickInfo: EventClickArg) {
    const link = clickInfo.event.extendedProps.linkDrive;

    alert(
      `Tarefa: ${clickInfo.event.title}\n` +
      `Perfil: ${clickInfo.event.extendedProps.profile}\n` +
      `Status: ${clickInfo.event.extendedProps.status}\n` +
      (link ? `Roteiro: ${link}` : 'Sem roteiro ainda')
    );
  }

  /**
   * 🔹 FILTRO POR PERFIL
   */
  const filteredEvents = events.filter(
    (event: any) => event.extendedProps?.profile === filterProfile
  );

  return (
    <div style={{ padding: 20 }}>
      {/* FILTRO */}
      <div style={{ marginBottom: 16 }}>
        <label>Perfil:&nbsp;</label>
        <select
          value={filterProfile}
          onChange={(e) => setFilterProfile(e.target.value as Profile)}
        >
          {profiles.map(profile => (
            <option key={profile} value={profile}>
              {profile}
            </option>
          ))}
        </select>
      </div>

      {/* CALENDÁRIO */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        events={filteredEvents}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="auto"
      />
    </div>
  );
}