'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [perfil, setPerfil] = useState<Perfil>('Confi');

  // 🔹 Carregar eventos da planilha
  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => {
        const mapped: EventInput[] = data.Agenda.map((item: any, index: number) => ({
          id: String(index),
          title: item.Conteudo_Principal,
          start: item.Data.split('/').reverse().join('-'),
          allDay: true,
          extendedProps: {
            profile: item.Perfil,
            type: item.Tipo,
            status: item.Status_Postagem,
          },
        }));
        setEvents(mapped);
      });
  }, []);

  // 🔹 Criar evento clicando no calendário
  async function handleDateSelect(selectInfo: any) {
    const title = prompt('Descrição do conteúdo (ex: Story checklist seguro residencial)');
    if (!title) return;

    const newEvent = {
      title,
      start: selectInfo.startStr,
      extendedProps: {
        profile: perfil,
        type: 'Story',
      },
    };

    // Atualiza UI
    setEvents(prev => [...prev, newEvent]);

    // Salva na planilha
    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Agenda de Conteúdos</h2>

      <select
        value={perfil}
        onChange={e => setPerfil(e.target.value as Perfil)}
        style={{ marginBottom: 10 }}
      >
        <option value="Confi">Confi</option>
        <option value="Cecília">Cecília</option>
        <option value="Luiza">Luiza</option>
        <option value="Júlio">Júlio</option>
      </select>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        select={handleDateSelect}
        events={events.filter(e => e.extendedProps?.profile === perfil)}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
      />
    </div>
  );
}