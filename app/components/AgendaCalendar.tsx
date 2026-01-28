'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  profile: Perfil;
  extendedProps: {
    linkDrive?: string;
    status: string;
  };
};

type Tarefa = {
  Bloco_ID: string;
  Titulo: string;
  Responsavel: Perfil;
  Data: string;
  Status: string;
  LinkDrive?: string;
  Notificar: string;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  const carregarAgenda = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();

      const agendaEvents: AgendaEvent[] = (data.Agenda || []).map((item: any, index: number) => ({
        id: index.toString(),
        title: `${item.Tipo}: ${item.Conteudo_Principal}`,
        start: item.Data_Inicio,
        end: item.Data_Fim,
        profile: item.Perfil,
        extendedProps: {
          linkDrive: item.LinkDrive || '',
          status: item.Status_Postagem,
        },
      }));

      setEvents(agendaEvents);
      setTarefas(data.Tarefas || []);
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
    }
  };

  useEffect(() => {
    carregarAgenda();
  }, []);

  const filteredEvents = events.filter(e => e.profile === filterProfile);

  const criarEvento = async (evento: any) => {
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evento),
      });
      const data = await res.json();
      if (data.ok) {
        alert('Evento salvo com sucesso!');
        carregarAgenda();
      } else {
        alert('Erro ao salvar evento: ' + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  const adicionarTesteAgenda = () => {
    criarEvento({
      Tipo_Evento: 'Agenda',
      Data_Inicio: '2026-01-28',
      Data_Fim: '2026-01-28',
      Tipo: 'Story',
      Conteudo_Principal: 'Story motivacional',
      Conteudo_Secundario: 'Enquete sobre objetivos',
      CTA: 'Deseja falar com o marketing? ✅',
      Status_Postagem: 'Pendente',
      Perfil: filterProfile,
    });
  };

  const adicionarTesteTarefa = () => {
    criarEvento({
      Tipo_Evento: 'Tarefa',
      Bloco_ID: (tarefas.length + 1).toString(),
      Titulo: 'Gravar vídeo Seguro Residencial',
      Responsavel: filterProfile,
      Data: '2026-01-28',
      Status: 'Pendente',
      LinkDrive: 'https://drive.google.com/...',
      Notificar: 'Sim',
    });
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Filtrar por perfil:</h2>
      <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
        {profiles.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <div style={{ margin: '1rem 0' }}>
        <button onClick={adicionarTesteAgenda}>Adicionar Agenda de Teste</button>
        <button onClick={adicionarTesteTarefa} style={{ marginLeft: '1rem' }}>Adicionar Tarefa de Teste</button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={filteredEvents}
        editable={true}
        selectable={true}
        eventClick={(info) => {
          alert(`Evento: ${info.event.title}\nLink do roteiro: ${info.event.extendedProps.linkDrive}`);
        }}
      />

      <div style={{ marginTop: '2rem' }}>
        <h3>Tarefas</h3>
        <table border={1} cellPadding={5}>
          <thead>
            <tr>
              <th>Bloco_ID</th>
              <th>Titulo</th>
              <th>Responsavel</th>
              <th>Data</th>
              <th>Status</th>
              <th>LinkDrive</th>
              <th>Notificar</th>
            </tr>
          </thead>
          <tbody>
            {tarefas
              .filter(t => t.Responsavel === filterProfile)
              .map((t, idx) => (
                <tr key={idx}>
                  <td>{t.Bloco_ID}</td>
                  <td>{t.Titulo}</td>
                  <td>{t.Responsavel}</td>
                  <td>{t.Data}</td>
                  <td>{t.Status}</td>
                  <td>{t.LinkDrive}</td>
                  <td>{t.Notificar}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}