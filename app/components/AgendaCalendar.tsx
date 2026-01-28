'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [perfil, setPerfil] = useState<Perfil>('Confi');

  async function carregarAgenda() {
    const res = await fetch('/api/agenda');
    const data = await res.json();

    if (!data?.Agenda) return;

    const eventos: EventInput[] = data.Agenda.map((item: any, index: number) => ({
      id: String(index),
      title: `${item.Tipo}: ${item.Conteudo_Principal}`,
      start: item.Data_Inicio,
      end: item.Data_Fim || item.Data_Inicio,
      extendedProps: {
        perfil: item.Perfil,
        status: item.Status_Postagem,
        cta: item.CTA,
      },
    }));

    setEvents(eventos);
  }

  useEffect(() => {
    carregarAgenda();
  }, []);

  async function handleDateClick(info: DateClickArg) {
    const conteudo = prompt('Conteúdo principal:');
    if (!conteudo) return;

    const payload = {
      Data_Inicio: info.dateStr, // YYYY-MM-DD
      Data_Fim: info.dateStr,
      Tipo_Evento: 'Produção',
      Tipo: 'Story',
      Conteudo_Principal: conteudo,
      Conteudo_Secundario: '',
      CTA: 'Deseja falar com o marketing? ✅',
      Status_Postagem: 'Pendente',
      Perfil: perfil,
    };

    const res = await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert('Erro ao salvar evento');
      return;
    }

    carregarAgenda();
  }

  const eventosFiltrados = events.filter(
    (e: any) => e.extendedProps?.perfil === perfil
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>Agenda de Conteúdo</h2>

      <select
        value={perfil}
        onChange={(e) => setPerfil(e.target.value as Perfil)}
        style={{ marginBottom: 16 }}
      >
        <option value="Confi">Confi</option>
        <option value="Cecília">Cecília</option>
        <option value="Luiza">Luiza</option>
        <option value="Júlio">Júlio</option>
      </select>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={eventosFiltrados}
        dateClick={handleDateClick}
        height="auto"
      />
    </div>
  );
}