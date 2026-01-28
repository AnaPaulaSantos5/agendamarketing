'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventInput } from '@fullcalendar/core';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

const perfis: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [perfilFiltro, setPerfilFiltro] = useState<Perfil>('Confi');

  /* =============================
     CARREGAR EVENTOS
     ============================= */
  useEffect(() => {
    async function loadAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Erro ao carregar agenda', err);
      }
    }
    loadAgenda();
  }, []);

  /* =============================
     CRIAR EVENTO (BLOCO)
     ============================= */
  async function handleSelect(selectInfo: DateSelectArg) {
    const title = prompt('Título do evento');
    if (!title) return;

    const tipo =
      prompt('Tipo (Story, Reel, Post, Organização)', 'Story') || 'Story';

    const linkDrive = prompt('Link do Drive (opcional)') || '';

    const newEvent: EventInput = {
      id: String(Date.now()),
      title,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      extendedProps: {
        profile: perfilFiltro,
        type: tipo,
        linkDrive,
        status: 'Pendente',
      },
    };

    // Atualiza UI
    setEvents(prev => [...prev, newEvent]);

    // Persiste no backend
    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });
  }

  /* =============================
     FILTRO POR PERFIL
     ============================= */
  const filteredEvents = events.filter(
    e => e.extendedProps?.profile === perfilFiltro
  );

  return (
    <div style={{ padding: 20 }}>
      {/* FILTRO */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ marginRight: 8 }}>Perfil:</label>
        <select
          value={perfilFiltro}
          onChange={e => setPerfilFiltro(e.target.value as Perfil)}
        >
          {perfis.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* CALENDÁRIO */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        select={handleSelect}
        events={filteredEvents}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        eventClick={(info) => {
          const p = info.event.extendedProps;
          alert(
            `📌 ${info.event.title}\n\n` +
            `Perfil: ${p.profile}\n` +
            `Tipo: ${p.type}\n` +
            `Status: ${p.status}\n\n` +
            `Roteiro:\n${p.linkDrive || '—'}`
          );
        }}
        height="auto"
      />
    </div>
  );
}