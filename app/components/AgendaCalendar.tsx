'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

const perfis = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [perfil, setPerfil] = useState('Confi');

  async function carregarAgenda() {
    const res = await fetch('/api/agenda');
    const data = await res.json();

    const transformed = data.Agenda.map((item: any, index: number) => ({
      id: index.toString(),
      title: item.Conteudo_Principal,
      start: item.Data_Inicio,
      end: item.Data_Fim
        ? new Date(new Date(item.Data_Fim).setDate(new Date(item.Data_Fim).getDate() + 1))
        : item.Data_Inicio,
      allDay: true,
      extendedProps: { perfil: item.Perfil },
    }));

    setEvents(transformed);
  }

  useEffect(() => {
    carregarAgenda();
  }, []);

  async function criarEvento(selectInfo: any) {
    const titulo = prompt('Título do evento / campanha');
    if (!titulo) return;

    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Data_Inicio: selectInfo.startStr,
        Data_Fim: selectInfo.endStr ?? selectInfo.startStr,
        Tipo_Evento: 'Bloco',
        Tipo: 'Campanha',
        Conteudo_Principal: titulo,
        Perfil: perfil,
      }),
    });

    await carregarAgenda();
  }

  return (
    <div>
      <select value={perfil} onChange={e => setPerfil(e.target.value)}>
        {perfis.map(p => (
          <option key={p}>{p}</option>
        ))}
      </select>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        select={criarEvento}
        events={events.filter(e => e.extendedProps?.perfil === perfil)}
      />
    </div>
  );
}