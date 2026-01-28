'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar, { EventInput, DateSelectArg, EventApi } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type EventData = {
  id: string;
  title: string;
  start: string;       // ISO string
  end: string;         // ISO string
  profile: string;     // Confi, Cecília, Luiza, Júlio
  linkDrive?: string;
  status: string;
};

const profiles = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [filterProfile, setFilterProfile] = useState<string>('Confi');

  // ✅ Busca e transforma dados da API
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();

        const transformed: EventInput[] = data.Agenda.map((item: any, index: number) => {
          // Converte dd/mm/yy para ISO
          const isoDate = new Date(item.Data.split('/').reverse().join('-')).toISOString();
          return {
            id: index.toString(),
            title: `${item.Tipo}: ${item.Conteudo_Principal}`,
            start: isoDate,
            end: isoDate,
            profile: item.Perfil,
            extendedProps: {
              linkDrive: item.LinkDrive || '',
              status: item.Status_Postagem,
            },
          };
        });

        setEvents(transformed);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }

    fetchAgenda();
  }, []);

  // ✅ Filtra eventos por perfil
  const filteredEvents = events.filter(e => e.profile === filterProfile);

  // ✅ Criação de evento clicando/arrastando
  const handleSelect = (selectInfo: DateSelectArg) => {
    const title = prompt('Título do evento:');
    if (title) {
      const newEvent: EventInput = {
        id: String(events.length + 1),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        profile: filterProfile,
        extendedProps: { status: 'Pendente', linkDrive: '' },
      };
      setEvents([...events, newEvent]);
    }
  };

  // ✅ Quando arrastar evento para outro horário
  const handleEventDrop = (eventDropInfo: { event: EventApi }) => {
    const updatedEvents = events.map(e =>
      e.id === eventDropInfo.event.id
        ? { ...e, start: eventDropInfo.event.start?.toISOString(), end: eventDropInfo.event.end?.toISOString() }
        : e
    );
    setEvents(updatedEvents);
  };

  // ✅ Clicar no evento
  const handleEventClick = (eventInfo: { event: EventApi }) => {
    alert(
      `Evento: ${eventInfo.event.title}\n` +
      `Link do roteiro: ${eventInfo.event.extendedProps.linkDrive || 'Sem link'}\n` +
      `Status: ${eventInfo.event.extendedProps.status}`
    );
  };

  return (
    <div>
      {/* Filtro por perfil */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value)}>
          {profiles.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Calendário */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={filteredEvents}
        editable={true}       // permite arrastar eventos
        selectable={true}     // permite criar eventos clicando/arrastando
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
      />
    </div>
  );
}