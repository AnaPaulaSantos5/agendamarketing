'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [perfil, setPerfil] = useState<Perfil | 'Todos'>('Todos');

  async function carregarAgenda() {
    const res = await fetch('/api/agenda');
    const data = await res.json();

    const parsed = data.Agenda
      .filter((item: any) => item.Data_Inicio)
      .map((item: any, index: number) => {
        const start = new Date(item.Data_Inicio);
        if (isNaN(start.getTime())) return null;

        const end = item.Data_Fim
          ? new Date(item.Data_Fim)
          : start;

        return {
          id: index.toString(),
          title: `${item.Tipo_Evento}: ${item.Conteudo_Principal}`,
          start: start.toISOString(),
          end: end.toISOString(),
          extendedProps: {
            perfil: item.Perfil,
            status: item.Status_Postagem,
            cta: item.CTA,
          },
        };
      })
      .filter(Boolean);

    setEvents(parsed);
  }

  useEffect(() => {
    carregarAgenda();
  }, []);

  const eventosFiltrados =
    perfil === 'Todos'
      ? events
      : events.filter(
          (e) => e.extendedProps?.perfil === perfil
        );

  async function handleSelect(info: any) {
    const titulo = prompt('Conteúdo principal:');
    if (!titulo) return;

    const payload = {
      Data_Inicio: info.startStr.split('T')[0],
      Data_Fim: info.endStr.split('T')[0],
      Tipo_Evento: 'Produção',
      Tipo: 'Story',
      Conteudo_Principal: titulo,
      Conteudo_Secundario: '',
      CTA: 'Deseja falar com o marketing? ✅',
      Status_Postagem: 'Pendente',
      Perfil: 'Confi',
    };

    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    carregarAgenda();
  }

  return (
    <div>
      <select value={perfil} onChange={(e) => setPerfil(e.target.value as any)}>
        <option value="Todos">Todos</option>
        <option value="Confi">Confi</option>
        <option value="Cecília">Cecília</option>
        <option value="Luiza">Luiza</option>
        <option value="Júlio">Júlio</option>
      </select>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        events={eventosFiltrados}
        select={handleSelect}
        height="auto"
      />
    </div>
  );
}