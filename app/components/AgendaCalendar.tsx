'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function AgendaCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [perfil, setPerfil] = useState('Todos');

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
    const perfilSelecionado =
      prompt('Perfil:', 'Confi Seguros') || 'Confi Seguros';

    const payload = {
      Data_Inicio: info.startStr,
      Data_Fim: info.endStr || info.startStr,
      Tipo_Evento: 'Conteúdo',
      Tipo: tipo,
      Conteudo_Principal: conteudo,
      Conteudo_Secundario: '',
      CTA: '',
      Status_Postagem: 'Planejado',
      Perfil: perfilSelecionado,
    };

    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    carregarAgenda();
  }

  const eventosFiltrados =
    perfil === 'Todos'
      ? events
      : events.filter(
          (e) => e.extendedProps?.perfil === perfil
        );

  return (
    <>
      {/* 🔽 FILTRO DE PERFIL */}
      <div style={{ marginBottom: 16 }}>
        <select
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
        >
          <option value="Todos">Todos</option>
          <option value="Confi Seguros">Confi Seguros</option>
          <option value="Cecília">Cecília</option>
          <option value="Luiza">Luiza</option>
          <option value="Júlio">Júlio</option>
        </select>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable
        select={handleSelect}
        events={eventosFiltrados}
        height="auto"
      />
    </>
  );
}