'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

interface AgendaEvent {
  id: string;
  title: string;
  start: string; // ISO date string
  end: string;   // ISO date string
  Perfil: Perfil;
  Tipo_Evento?: string;
  Tipo?: string;
  Conteudo_Principal?: string;
  Conteudo_Secundario?: string;
  CTA?: string;
  Status_Postagem?: string;
  LinkDrive?: string;
}

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  const [newEvent, setNewEvent] = useState({
    start: '',
    end: '',
    Tipo_Evento: '',
    Tipo: '',
    Conteudo_Principal: '',
    Conteudo_Secundario: '',
    CTA: '',
    Perfil: 'Confi' as Perfil,
  });

  // Buscar agenda da API
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        console.log('Agenda recebida:', data);

        const transformed = (data.Agenda || []).map((item: any, index: number) => ({
          id: index.toString(),
          title: item.Conteudo_Principal || '',
          start: item.Data_Inicio,
          end: item.Data_Fim,
          Perfil: item.Perfil as Perfil,
          Tipo_Evento: item.Tipo_Evento,
          Tipo: item.Tipo,
          Conteudo_Principal: item.Conteudo_Principal,
          Conteudo_Secundario: item.Conteudo_Secundario,
          CTA: item.CTA,
          Status_Postagem: item.Status_Postagem,
          LinkDrive: item.LinkDrive || '',
        }));

        setEvents(transformed);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchAgenda();
  }, []);

  // Filtrar por perfil
  const filteredEvents = (events || []).filter(e => e.Perfil === filterProfile);

  // Criar novo evento
  const handleAddEvent = async () => {
    if (!newEvent.start || !newEvent.end || !newEvent.Tipo_Evento) {
      alert('Preencha pelo menos Data Início, Data Fim e Tipo de Evento');
      return;
    }

    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      const data = await res.json();
      console.log('Evento salvo:', data);

      // Atualiza a agenda local
      setEvents(prev => [
        ...prev,
        {
          id: (prev.length + 1).toString(),
          title: newEvent.Conteudo_Principal || '',
          start: newEvent.start,
          end: newEvent.end,
          Perfil: newEvent.Perfil,
          Tipo_Evento: newEvent.Tipo_Evento,
          Tipo: newEvent.Tipo,
          Conteudo_Principal: newEvent.Conteudo_Principal,
          Conteudo_Secundario: newEvent.Conteudo_Secundario,
          CTA: newEvent.CTA,
          Status_Postagem: 'Pendente',
        },
      ]);

      // Resetar formulário
      setNewEvent({
        start: '',
        end: '',
        Tipo_Evento: '',
        Tipo: '',
        Conteudo_Principal: '',
        Conteudo_Secundario: '',
        CTA: '',
        Perfil: 'Confi',
      });
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
    }
  };

  return (
    <div>
      <h2>Agenda Marketing</h2>

      {/* Filtro por perfil */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select
          value={filterProfile}
          onChange={e => setFilterProfile(e.target.value as Perfil)}
        >
          {profiles.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Formulário de criação de evento */}
      <div style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h3>Adicionar Evento</h3>
        <input
          type="date"
          value={newEvent.start}
          onChange={e => setNewEvent({ ...newEvent, start: e.target.value })}
        />
        <input
          type="date"
          value={newEvent.end}
          onChange={e => setNewEvent({ ...newEvent, end: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tipo de Evento"
          value={newEvent.Tipo_Evento}
          onChange={e => setNewEvent({ ...newEvent, Tipo_Evento: e.target.value })}
        />
        <input
          type="text"
          placeholder="Tipo"
          value={newEvent.Tipo}
          onChange={e => setNewEvent({ ...newEvent, Tipo: e.target.value })}
        />
        <input
          type="text"
          placeholder="Conteúdo Principal"
          value={newEvent.Conteudo_Principal}
          onChange={e => setNewEvent({ ...newEvent, Conteudo_Principal: e.target.value })}
        />
        <input
          type="text"
          placeholder="Conteúdo Secundário"
          value={newEvent.Conteudo_Secundario}
          onChange={e => setNewEvent({ ...newEvent, Conteudo_Secundario: e.target.value })}
        />
        <input
          type="text"
          placeholder="CTA"
          value={newEvent.CTA}
          onChange={e => setNewEvent({ ...newEvent, CTA: e.target.value })}
        />
        <select
          value={newEvent.Perfil}
          onChange={e => setNewEvent({ ...newEvent, Perfil: e.target.value as Perfil })}
        >
          {profiles.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button onClick={handleAddEvent}>Adicionar Evento</button>
      </div>

      {/* Calendário */}
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
          alert(`
Evento: ${info.event.title}
Tipo Evento: ${info.event.extendedProps.Tipo_Evento}
Conteúdo Principal: ${info.event.extendedProps.Conteudo_Principal}
Conteúdo Secundário: ${info.event.extendedProps.Conteudo_Secundario}
CTA: ${info.event.extendedProps.CTA}
Link Drive: ${info.event.extendedProps.LinkDrive || 'Não informado'}
Status: ${info.event.extendedProps.Status_Postagem || 'Pendente'}
Perfil: ${info.event.extendedProps.Perfil}
          `);
        }}
      />
    </div>
  );
}
