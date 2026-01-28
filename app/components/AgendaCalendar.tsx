'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type Evento = {
  id: string;
  title: string;
  start: string;
  end: string;
  perfil: Perfil;
  extendedProps: {
    linkDrive?: string;
    status: string;
  };
};

const perfis: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [perfilFiltro, setPerfilFiltro] = useState<Perfil>('Confi');

  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(data => {
        const transformados: Evento[] = data.agenda.map((item: any, i: number) => ({
          id: i.toString(),
          title: `${item.Tipo}: ${item.Conteudo_Principal}`,
          start: item.Data_Inicio,
          end: item.Data_Fim,
          perfil: item.Perfil,
          extendedProps: {
            status: item.Status_Postagem,
          },
        }));
        setEventos(transformados);
      });
  }, []);

  const filteredEventos = eventos.filter(e => e.perfil === perfilFiltro);

  const handleDateSelect = (selectInfo: any) => {
    const titulo = prompt('Título do evento:');
    if (!titulo) return;

    const perfil = prompt('Perfil (Confi, Cecília, Luiza, Júlio):', 'Confi') as Perfil;
    const start = selectInfo.startStr;
    const end = selectInfo.endStr;

    fetch('/api/agenda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Data_Inicio: start,
        Data_Fim: end,
        Tipo_Evento: 'Evento',
        Tipo: 'Custom',
        Conteudo_Principal: titulo,
        Conteudo_Secundario: '',
        CTA: '',
        Status_Postagem: 'Pendente',
        Perfil: perfil,
        Tarefas: [],
      }),
    }).then(() => {
      setEventos([...eventos, { id: Date.now().toString(), title: titulo, start, end, perfil, extendedProps: { status: 'Pendente' } }]);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={perfilFiltro} onChange={e => setPerfilFiltro(e.target.value as Perfil)}>
          {perfis.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={filteredEventos}
        editable={true}
        selectable={true}
        select={handleDateSelect}
        eventClick={(info) => alert(`Evento: ${info.event.title}\nStatus: ${info.event.extendedProps.status}`)}
      />
    </div>
  );
}
