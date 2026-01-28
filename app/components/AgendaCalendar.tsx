'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [perfil, setPerfil] = useState('Todos');

  async function loadAgenda() {
    const res = await fetch('/api/agenda');
    const data = await res.json();
    setEvents(data.events);
  }

  useEffect(() => {
    loadAgenda();
  }, []);

  const filtered =
    perfil === 'Todos'
      ? events
      : events.filter(e => e.extendedProps?.perfil === perfil);

  return (
    <>
      <select onChange={e => setPerfil(e.target.value)}>
        <option value="Todos">Todos</option>
        <option value="Confi">Confi</option>
        <option value="Cecília">Cecília</option>
        <option value="Luiza">Luiza</option>
        <option value="Júlio">Júlio</option>
      </select>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filtered}
        selectable
        editable
        select={async (info) => {
          const titulo = prompt('Nome da tarefa');
          if (!titulo) return;

          await fetch('/api/agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Data_Inicio: info.startStr,
              Data_Fim: info.endStr,
              Tipo: 'Tarefa',
              Conteudo_Principal: titulo,
              Status_Postagem: 'Pendente',
              Perfil: 'Confi',
            }),
          });

          loadAgenda(); // 🔥 ISSO É O QUE ESTAVA FALTANDO
        }}
      />
    </>
  );
}