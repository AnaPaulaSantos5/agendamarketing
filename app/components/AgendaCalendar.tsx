'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type EventData = {
  id: string;
  title: string;
  start: string;       // ISO string
  end: string;         // ISO string
  profile: Perfil;
  tipo_evento?: string;
  tipo?: string;
  conteudo_principal?: string;
  conteudo_secundario?: string;
  cta?: string;
  status?: string;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();

        const transformed: EventInput[] = data.Agenda.map((item: any, index: number) => ({
          id: index.toString(),
          title: `${item.Tipo_Evento || item.Tipo}: ${item.Conteudo_Principal || ''}`,
          start: item.Data_Inicio,
          end: item.Data_Fim,
          profile: item.Perfil as Perfil,
          extendedProps: {
            tipo_evento: item.Tipo_Evento,
            tipo: item.Tipo,
            conteudo_principal: item.Conteudo_Principal,
            conteudo_secundario: item.Conteudo_Secundario,
            cta: item.CTA,
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
  const filteredEvents = events.filter((e: any) => e.profile === filterProfile);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
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
        editable={true}    // permite arrastar eventos
        selectable={true}  // permite criar eventos clicando
        eventClick={(info) => {
          alert(`
Evento: ${info.event.title}
Perfil: ${info.event.extendedProps.profile}
Tipo Evento: ${info.event.extendedProps.tipo_evento || ''}
Conteúdo Principal: ${info.event.extendedProps.conteudo_principal || ''}
Conteúdo Secundário: ${info.event.extendedProps.conteudo_secundario || ''}
CTA: ${info.event.extendedProps.cta || ''}
Status: ${info.event.extendedProps.status || ''}
          `);
        }}
      />
    </div>
  );
}
