'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import { useEffect, useState } from 'react';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);

  async function carregar() {
    const res = await fetch('/api/agenda');
    const json = await res.json();

    const evts: EventInput[] = json.Agenda.map((item: any, i: number) => ({
      id: String(i),
      title: item.Conteudo_Principal || 'Sem título',
      start: item.Data_Inicio, // ISO STRING
      end: item.Data_Fim || item.Data_Inicio,
    }));

    setEvents(evts);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criarEvento(info: any) {
    const titulo = prompt('Conteúdo principal');
    if (!titulo) return;

    const iso = info.dateStr; // 👈 já vem YYYY-MM-DD

    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Data_Inicio: iso,
        Data_Fim: iso,
        Tipo_Evento: 'Conteúdo',
        Tipo: 'Story',
        Conteudo_Principal: titulo,
        Conteudo_Secundario: '',
        CTA: 'Deseja falar com o marketing? ✅',
        Status_Postagem: 'Pendente',
        Perfil: 'Confi',
      }),
    });

    carregar(); // 🔥 recarrega da planilha
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      events={events}
      dateClick={criarEvento}
      height="auto"
    />
  );
}