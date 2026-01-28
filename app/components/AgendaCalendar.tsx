'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type AgendaEvent = {
  id: string;
  start: string; // ISO string
  end: string;   // ISO string
  title: string;
  tipo_evento: string;
  tipo: string;
  conteudo_principal: string;
  conteudo_secundario: string;
  cta: string;
  status_postagem: string;
  profile: Perfil;
  linkDrive?: string;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<AgendaEvent>>({});

  // Carregar agenda da planilha
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data.Agenda || []);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchAgenda();
  }, []);

  // Abrir modal para criar evento
  const handleDateClick = (arg: any) => {
    setNewEvent({ start: arg.dateStr, end: arg.dateStr, profile: filterProfile });
    setModalOpen(true);
  };

  // Salvar evento na planilha
  const saveEvent = async () => {
    if (!newEvent.start || !newEvent.end || !newEvent.title || !newEvent.profile) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      const saved = await res.json();
      setEvents([...events, saved]);
      setModalOpen(false);
      setNewEvent({});
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      alert('Erro ao salvar evento');
    }
  };

  // Filtrar eventos por perfil
  const filteredEvents = events.filter(e => e.profile === filterProfile);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
          {profiles.map(p => <option key={p} value={p}>{p}</option>)}
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
        events={filteredEvents.map(e => ({
          id: e.id,
          title: `${e.tipo}: ${e.conteudo_principal}`,
          start: e.start,
          end: e.end,
          extendedProps: { ...e },
        }))}
        selectable={true}
        editable={true}
        dateClick={handleDateClick}
        eventClick={(info) => {
          const e = info.event.extendedProps as AgendaEvent;
          alert(`Evento: ${e.conteudo_principal}\nLink do roteiro: ${e.linkDrive || ''}`);
        }}
      />

      {/* Modal para criar evento */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '400px' }}>
            <h2>Novo Evento</h2>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Início:</label>
              <input type="date" value={newEvent.start?.slice(0,10) || ''} 
                onChange={e => setNewEvent({...newEvent, start: e.target.value})}/>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Fim:</label>
              <input type="date" value={newEvent.end?.slice(0,10) || ''} 
                onChange={e => setNewEvent({...newEvent, end: e.target.value})}/>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Tipo Evento:</label>
              <input type="text" value={newEvent.tipo_evento || ''} 
                onChange={e => setNewEvent({...newEvent, tipo_evento: e.target.value})}/>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Tipo:</label>
              <input type="text" value={newEvent.tipo || ''} 
                onChange={e => setNewEvent({...newEvent, tipo: e.target.value})}/>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Conteúdo Principal:</label>
              <input type="text" value={newEvent.conteudo_principal || ''} 
                onChange={e => setNewEvent({...newEvent, conteudo_principal: e.target.value})}/>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Conteúdo Secundário:</label>
              <input type="text" value={newEvent.conteudo_secundario || ''} 
                onChange={e => setNewEvent({...newEvent, conteudo_secundario: e.target.value})}/>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>CTA:</label>
              <input type="text" value={newEvent.cta || ''} 
                onChange={e => setNewEvent({...newEvent, cta: e.target.value})}/>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Status:</label>
              <input type="text" value={newEvent.status_postagem || ''} 
                onChange={e => setNewEvent({...newEvent, status_postagem: e.target.value})}/>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>Perfil:</label>
              <select value={newEvent.profile || ''} onChange={e => setNewEvent({...newEvent, profile: e.target.value as Perfil})}>
                {profiles.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={saveEvent}>Salvar</button>
              <button onClick={() => setModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}