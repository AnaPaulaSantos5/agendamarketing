'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

type AgendaItem = {
  Data: string;
  Tipo: string;
  Conteudo_Principal: string;
  Conteudo_Secundario?: string;
  CTA?: string;
  Status_Postagem: string;
  Perfil: string;
  LinkDrive?: string;
};

const PROFILES = ['Todos', 'Confi Seguros', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [profileFilter, setProfileFilter] = useState('Todos');

  useEffect(() => {
    async function loadAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const json = await res.json();

        if (!json?.Agenda) return;

        const parsed: EventInput[] = json.Agenda.map(
          (item: AgendaItem, index: number) => {
            const [day, month, year] = item.Data.split('/');
            const isoDate = `20${year}-${month}-${day}`;

            return {
              id: String(index),
              title: `${item.Tipo} — ${item.Conteudo_Principal}`,
              start: isoDate,
              end: isoDate,
              extendedProps: {
                profile: item.Perfil,
                status: item.Status_Postagem,
                linkDrive: item.LinkDrive || '',
              },
            };
          }
        );

        setEvents(parsed);
      } catch (err) {
        console.error('Erro ao carregar agenda', err);
      }
    }

    loadAgenda();
  }, []);

  const filteredEvents =
    profileFilter === 'Todos'
      ? events
      : events.filter(
          (e) => e.extendedProps?.profile === profileFilter
        );

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ marginBottom: 10 }}>Agenda de Conteúdo</h2>

      <select
        value={profileFilter}
        onChange={(e) => setProfileFilter(e.target.value)}
        style={{ marginBottom: 20, padding: 6 }}
      >
        {PROFILES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale="pt-br"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={filteredEvents}
        editable
        selectable
        eventClick={(info) => {
          const { profile, status, linkDrive } = info.event.extendedProps;

          alert(
            `Perfil: ${profile}\nStatus: ${status}\nRoteiro: ${
              linkDrive || 'Não informado'
            }`
          );
        }}
      />
    </div>
  );
}