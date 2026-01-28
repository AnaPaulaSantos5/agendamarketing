'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [perfil, setPerfil] = useState<Perfil>('Confi');

  async function carregarAgenda() {
    const res = await fetch('/api/agenda');
    const data = await res.json();

    const transformed: EventInput[] = data.Agenda.map((item: any, index: number) => ({
      id: index.toString(),
      title:
        item.Tipo_Evento === 'Bloco'
          ? `📌 ${item.Conteudo_Principal}`
          : `${item.Tipo}: ${item.Conteudo_Principal}`,
      start: item.Data_Inicio,
      end: item.Data_Fim
        ? new Date(new Date(item.Data_Fim).setDate(new Date(item.Data_Fim).getDate() + 1))
        : item.Data_Inicio,
      allDay: true,
      backgroundColor: item.Tipo_Evento === 'Bloco' ? '#2563eb' : '#16a34a',
      borderColor: item.Tipo_Evento === 'Bloco' ? '#2563eb' : '#16a34a',
      extendedProps: {
        perfil: item.Perfil,
        tipoEvento: item.Tipo_Evento,
      },
    }));

    setEvents(transformed);
  }

  useEffect(() => {
    carregarAgenda();
  }, []);

  return (
    <div>
      <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)}>
        <option>Confi</option>
        <option>Cecília</option>
        <option>Luiza</option>
        <option>Júlio</option>
      </select>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        events={events.filter(e => e.extendedProps?.perfil === perfil)}
      />
    </div>
  );
}