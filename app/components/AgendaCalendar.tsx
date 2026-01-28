'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useEffect, useState } from 'react';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  async function loadEvents() {
    const res = await fetch('/api/agenda');
    const data = await res.json();

    const agendaEvents = data.agenda.map((item: any) => ({
      id: item.id,
      title: `${item.Tipo} – ${item.Conteudo_Principal}`,
      start: item.Data_Inicio,
      end: item.Data_Fim,
      extendedProps: item,
    }));

    setEvents(agendaEvents);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleSelect(info: any) {
    const tipoEvento = prompt('Tipo_Evento (Agenda ou Tarefa)?', 'Agenda');
    if (!tipoEvento) return;

    if (tipoEvento === 'Agenda') {
      const Tipo = prompt('Tipo (Story, Reel, Post, Gravação)');
      const Conteudo_Principal = prompt('Conteúdo principal');
      const Perfil = prompt('Perfil (Confi, Cecília, Luiza, Júlio)');

      if (!Tipo || !Conteudo_Principal || !Perfil) return;

      await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Tipo_Evento: 'Agenda',
          Data_Inicio: info.startStr,
          Data_Fim: info.endStr || info.startStr,
          Tipo,
          Conteudo_Principal,
          Perfil,
        }),
      });
    }

    if (tipoEvento === 'Tarefa') {
      const Titulo = prompt('Título da tarefa');
      const Responsavel = prompt('Responsável');
      const LinkDrive = prompt('Link do Drive (opcional)');

      if (!Titulo || !Responsavel) return;

      await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Tipo_Evento: 'Tarefa',
          Bloco_ID: Date.now().toString(),
          Titulo,
          Responsavel,
          Data: info.startStr,
          LinkDrive,
        }),
      });
    }

    await loadEvents();
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      selectable
      select={handleSelect}
      events={events}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
    />
  );
}