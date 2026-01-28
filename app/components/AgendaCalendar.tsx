'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar, { EventInput } from '@fullcalendar/react';
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

  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        // Transformar dados da API para o formato do FullCalendar
        const transformed: EventInput[] = data.Agenda.map((item: any, index: number) => ({
          id: index.toString(),
          title: `${item.Tipo}: ${item.Conteudo_Principal}`,
          start: item.Data,       // ajustar para ISO string se necessário
          end: item.Data,         // pode ajustar para horários específicos
          profile: item.Perfil,
          extendedProps: {
            linkDrive: item.LinkDrive || '',
            status: item.Status_Postagem,
          },
        }));
        setEvents(transformed);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchAgenda();
  }, []);

  // Filtrar por perfil
  const filteredEvents = events.filter(e => e.profile === filterProfile);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value)}>
          {profiles.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={filteredEvents}
        editable={true}           // permite arrastar eventos
        selectable={true}         // permite criar eventos clicando
        eventClick={(info) => {
          alert(`Evento: ${info.event.title}\nLink do roteiro: ${info.event.extendedProps.linkDrive}`);
        }}
      />
    </div>
  );
}