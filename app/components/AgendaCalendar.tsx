'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Evento = {
  id: string;
  title: string;
  start: string;
  end: string;
  perfil: string;
  extendedProps: {
    tipoEvento: string;
    status: string;
    cta?: string;
  };
};

const PERFIS = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<Evento[]>([]);
  const [perfilFiltro, setPerfilFiltro] = useState('Confi');

  // 🔹 Carregar eventos da API
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/agenda');
      const data = await res.json();

      const parsed: Evento[] = data.Agenda.map((item: any, index: number) => ({
        id: index.toString(),
        title: `${item.Tipo_Evento}: ${item.Conteudo_Principal}`,
        start: item.Data_Inicio,
        end: item.Data_Fim,
        perfil: item.Perfil,
        extendedProps: {
          tipoEvento: item.Tipo_Evento,
          status: item.Status_Postagem,
          cta: item.CTA,
        },
      }));

      setEvents(parsed);
    }

    load();
  }, []);

  // 🔹 Criar evento no calendário
  async function handleSelect(info: any) {
    const titulo = prompt('Conteúdo principal (ex: Gravar vídeo Seguro Residencial)');
    if (!titulo) return;

    const tipoEvento = prompt('Tipo do evento (BLOCO ou TAREFA)', 'TAREFA') || 'TAREFA';

    const novoEvento = {
      Data_Inicio: info.startStr,
      Data_Fim: info.endStr,
      Tipo_Evento: tipoEvento,
      Tipo: tipoEvento === 'BLOCO' ? 'Planejamento' : 'Execução',
      Conteudo_Principal: titulo,
      Conteudo_Secundario: '',
      CTA: 'Deseja contactar o marketing? 1.Sim 2.Não',
      Status_Postagem: 'Planejado',
      Perfil: perfilFiltro,
    };

    await fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoEvento),
    });

    // Recarrega agenda
    const res = await fetch('/api/agenda');
    const data = await res.json();

    const parsed: Evento[] = data.Agenda.map((item: any, index: number) => ({
      id: index.toString(),
      title: `${item.Tipo_Evento}: ${item.Conteudo_Principal}`,
      start: item.Data_Inicio,
      end: item.Data_Fim,
      perfil: item.Perfil,
      extendedProps: {
        tipoEvento: item.Tipo_Evento,
        status: item.Status_Postagem,
        cta: item.CTA,
      },
    }));

    setEvents(parsed);
  }

  const eventosFiltrados = events.filter(e => e.perfil === perfilFiltro);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <label>Perfil: </label>
        <select value={perfilFiltro} onChange={e => setPerfilFiltro(e.target.value)}>
          {PERFIS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable
        editable
        select={handleSelect}
        events={eventosFiltrados}
        height="auto"
      />
    </div>
  );
}