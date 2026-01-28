'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  /* =========================
     CARREGAR EVENTOS
  ========================= */
  async function carregarAgenda() {
    const res = await fetch('/api/agenda');
    const data = await res.json();
    setEvents(data);
  }

  useEffect(() => {
    carregarAgenda();
  }, []);

  /* =========================
     CRIAR EVENTO
  ========================= */
  async function handleSelect(info: any) {
    const payload = {
      Data_Inicio: info.startStr,
      Data_Fim: info.endStr || info.startStr,
      Tipo_Evento: 'Conteúdo',
      Tipo: 'Story',
      Conteudo_Principal: 'Novo conteúdo',
      Conteudo_Secundario: '',
      CTA: '',
      Status_Postagem: 'Planejado',
      Perfil: 'Confi Seguros',
    };

    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    carregarAgenda(); // 🔥 ESSENCIAL
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