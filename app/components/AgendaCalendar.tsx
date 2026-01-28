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
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  profile: Perfil;
  tipoEvento: string;
  tipo: string;
  conteudoPrincipal: string;
  conteudoSecundario: string;
  cta: string;
  status: string;
  linkDrive?: string;
};

type Tarefa = {
  blocoId: string;
  titulo: string;
  responsavel: Perfil;
  data: string;
  status: string;
  linkDrive?: string;
  notificar: boolean;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<AgendaEvent>>({ profile: 'Confi' });

  // --- Carregar Agenda e Tarefas da API ---
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        if (data.Agenda) setEvents(data.Agenda);
        if (data.Tarefas) setTarefas(data.Tarefas);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchAgenda();
  }, []);

  const filteredEvents = events.filter(e => e.profile === filterProfile);

  // --- Função para adicionar evento ---
  async function handleAddEvent() {
    if (
      !newEvent.start ||
      !newEvent.end ||
      !newEvent.tipoEvento ||
      !newEvent.tipo ||
      !newEvent.conteudoPrincipal ||
      !newEvent.conteudoSecundario ||
      !newEvent.cta ||
      !newEvent.status ||
      !newEvent.profile
    ) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const evento: AgendaEvent = {
      id: String(events.length),
      start: newEvent.start!,
      end: newEvent.end!,
      tipoEvento: newEvent.tipoEvento!,
      tipo: newEvent.tipo!,
      conteudoPrincipal: newEvent.conteudoPrincipal!,
      conteudoSecundario: newEvent.conteudoSecundario!,
      cta: newEvent.cta!,
      status: newEvent.status!,
      profile: newEvent.profile as Perfil,
      title: `${newEvent.tipo}: ${newEvent.conteudoPrincipal}`,
      linkDrive: newEvent.linkDrive || '',
    };

    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento }),
      });
      if (res.ok) {
        setEvents([...events, evento]);
        alert('Evento adicionado com sucesso!');
        setNewEvent({ profile: 'Confi' });
        setShowForm(false);
      } else {
        alert('Erro ao salvar evento');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  }

  return (
    <div>
      <h2>Agenda</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
          {profiles.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button style={{ marginLeft: '1rem' }} onClick={() => setShowForm(true)}>Adicionar Evento</button>
      </div>

      {/* --- FullCalendar --- */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={filteredEvents.map(e => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          extendedProps: { ...e },
        }))}
        editable={true}
        selectable={true}
        eventClick={(info) => {
          const e = info.event.extendedProps as AgendaEvent;
          alert(`Evento: ${info.event.title}\nLink do roteiro: ${e.linkDrive || 'N/A'}`);
        }}
      />

      {/* --- Formulário Modal --- */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left:0, width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center' }}>
          <div style={{ backgroundColor:'#fff', padding:'2rem', borderRadius:'8px', width:'400px' }}>
            <h3>Adicionar Evento</h3>
            <label>Data Início: </label>
            <input type="date" value={newEvent.start || ''} onChange={e => setNewEvent({ ...newEvent, start: e.target.value })} />
            <br />
            <label>Data Fim: </label>
            <input type="date" value={newEvent.end || ''} onChange={e => setNewEvent({ ...newEvent, end: e.target.value })} />
            <br />
            <label>Tipo Evento: </label>
            <input type="text" value={newEvent.tipoEvento || ''} onChange={e => setNewEvent({ ...newEvent, tipoEvento: e.target.value })} />
            <br />
            <label>Tipo: </label>
            <input type="text" value={newEvent.tipo || ''} onChange={e => setNewEvent({ ...newEvent, tipo: e.target.value })} />
            <br />
            <label>Conteúdo Principal: </label>
            <input type="text" value={newEvent.conteudoPrincipal || ''} onChange={e => setNewEvent({ ...newEvent, conteudoPrincipal: e.target.value })} />
            <br />
            <label>Conteúdo Secundário: </label>
            <input type="text" value={newEvent.conteudoSecundario || ''} onChange={e => setNewEvent({ ...newEvent, conteudoSecundario: e.target.value })} />
            <br />
            <label>CTA: </label>
            <input type="text" value={newEvent.cta || ''} onChange={e => setNewEvent({ ...newEvent, cta: e.target.value })} />
            <br />
            <label>Status: </label>
            <input type="text" value={newEvent.status || ''} onChange={e => setNewEvent({ ...newEvent, status: e.target.value })} />
            <br />
            <label>Perfil: </label>
            <select value={newEvent.profile || 'Confi'} onChange={e => setNewEvent({ ...newEvent, profile: e.target.value as Perfil })}>
              {profiles.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <br />
            <label>Link do Drive (opcional): </label>
            <input type="text" value={newEvent.linkDrive || ''} onChange={e => setNewEvent({ ...newEvent, linkDrive: e.target.value })} />
            <br />
            <button onClick={handleAddEvent}>Salvar</button>
            <button onClick={() => setShowForm(false)} style={{ marginLeft:'1rem' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}