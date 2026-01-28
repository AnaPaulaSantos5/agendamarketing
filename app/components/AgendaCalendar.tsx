'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  async function carregarAgenda() {
    const res = await fetch('/api/agenda');
    const data = await res.json();
    setEvents(data);
  }

  useEffect(() => {
    carregarAgenda();
  }, []);

  async function handleSelect(info: any) {
    const conteudo = prompt('Conteúdo principal:');
    if (!conteudo) return;

    const tipo = prompt('Tipo (Story, Reels, Post):', 'Story') || 'Story';
    const perfil = prompt('Perfil:', 'Confi Seguros') || 'Confi Seguros';

    const payload = {
      Data_Inicio: info.startStr,
      Data_Fim: info.endStr || info.startStr,
      Tipo_Evento: 'Conteúdo',
      Tipo: tipo,
      Conteudo_Principal: conteudo,
      Conteudo_Secundario: '',
      CTA: '',
      Status_Postagem: 'Planejado',
      Perfil: perfil,
    };

    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    carregarAgenda();
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      selectable
      select={handleSelect}
      events={events}
      height="auto"
    />
  );
}