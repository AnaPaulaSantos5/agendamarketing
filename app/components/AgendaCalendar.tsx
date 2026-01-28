'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

const perfis: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [perfilFiltro, setPerfilFiltro] = useState<Perfil | 'Todos'>('Todos');

  useEffect(() => {
    carregarAgenda();
  }, []);

  async function carregarAgenda() {
    const res = await fetch('/api/agenda');
    const data = await res.json();

    const transformed: EventInput[] = data.Agenda.map((item: any, index: number) => {
      const isBloco = item.Tipo_Evento === 'BLOCO';

      return {
        id: index.toString(),
        title: item.Conteudo_Principal || '(Sem título)',
        start: item.Data_Inicio,
        end: item.Data_Fim || item.Data_Inicio,
        allDay: isBloco,
        display: isBloco ? 'background' : 'auto',
        extendedProps: {
          perfil: item.Perfil,
          tipo: item.Tipo,
          status: item.Status_Postagem,
          linkDrive: item.LinkDrive || '',
          tipoEvento: item.Tipo_Evento,
        },
      };
    });

    setEvents(transformed);
  }

  function handleSelect(info: any) {
    const titulo = prompt('Descrição da tarefa ou bloco:');
    if (!titulo) return;

    const tipoEvento = confirm('OK = BLOCO | Cancelar = TAREFA') ? 'BLOCO' : 'TAREFA';

    const novoEvento: EventInput = {
      title: titulo,
      start: info.startStr,
      end: info.endStr,
      allDay: tipoEvento === 'BLOCO',
      display: tipoEvento === 'BLOCO' ? 'background' : 'auto',
      extendedProps: {
        perfil: 'Confi',
        tipoEvento,
        status: 'Planejado',
      },
    };

    setEvents(prev => [...prev, novoEvento]);

    fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoEvento),
    });
  }

  const eventosFiltrados = perfilFiltro === 'Todos'
    ? events
    : events.filter(e => e.extendedProps?.perfil === perfilFiltro);

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <label>Perfil: </label>
        <select value={perfilFiltro} onChange={e => setPerfilFiltro(e.target.value as any)}>
          <option value="Todos">Todos</option>
          {perfis.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        events={eventosFiltrados}
        select={handleSelect}
        eventClick={(info) => {
          const e = info.event.extendedProps;
          alert(
            `Evento: ${info.event.title}\nPerfil: ${e.perfil}\nStatus: ${e.status}`
          );
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
      />
    </div>
  );
}