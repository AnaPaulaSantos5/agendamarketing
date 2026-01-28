'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type EventData = {
  id?: string;
  start: string;           // Data_Inicio em YYYY-MM-DD
  end: string;             // Data_Fim em YYYY-MM-DD
  tipo_evento: string;
  tipo: string;
  conteudo_principal: string;
  conteudo_secundario?: string;
  cta?: string;
  status_postagem?: string;
  profile: Perfil;
  linkDrive?: string;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<EventData>>({});

  // Buscar eventos da planilha
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

  // Salvar evento novo
  const saveEvent = async () => {
    if (
      !newEvent.start ||
      !newEvent.end ||
      !newEvent.tipo_evento ||
      !newEvent.tipo ||
      !newEvent.conteudo_principal ||
      !newEvent.profile
    ) {
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

  // Eventos filtrados por perfil
  const filteredEvents = events.filter(e => e.profile === filterProfile);

  return (
    <div>
      <h2>Agenda</h2>

      {/* Filtro por perfil */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
          {profiles.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button style={{ marginLeft: '1rem' }} onClick={() => setModalOpen(true)}>Adicionar Evento</button>
      </div>

      {/* Calendário */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={filteredEvents.map(ev => ({
          id: ev.id,
          title: `${ev.tipo}: ${ev.conteudo_principal}`,
          start: ev.start,
          end: ev.end,
          extendedProps: {
            tipo_evento: ev.tipo_evento,
            conteudo_secundario: ev.conteudo_secundario,
            cta: ev.cta,
            status_postagem: ev.status_postagem,
            profile: ev.profile,
            linkDrive: ev.linkDrive,
          },
        }))}
        editable={true}
        selectable={true}
        eventClick={(info) => {
          const props = info.event.extendedProps;
          alert(
            `Evento: ${info.event.title}\n` +
            `Tipo: ${props.tipo_evento}\n` +
            `Conteúdo Secundário: ${props.conteudo_secundario || '-'}\n` +
            `CTA: ${props.cta || '-'}\n` +
            `Link do Roteiro: ${props.linkDrive || '-'}`
          );
        }}
      />

      {/* Modal simples para adicionar evento */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: '#fff', padding: '1rem', width: '400px', borderRadius: '5px' }}>
            <h3>Adicionar Evento</h3>
            <label>Data Início *</label>
            <input type="date" value={newEvent.start || ''} onChange={e => setNewEvent({...newEvent, start: e.target.value})} />
            
            <label>Data Fim *</label>
            <input type="date" value={newEvent.end || ''} onChange={e => setNewEvent({...newEvent, end: e.target.value})} />
            
            <label>Tipo de Evento *</label>
            <input type="text" value={newEvent.tipo_evento || ''} onChange={e => setNewEvent({...newEvent, tipo_evento: e.target.value})} />
            
            <label>Tipo *</label>
            <input type="text" value={newEvent.tipo || ''} onChange={e => setNewEvent({...newEvent, tipo: e.target.value})} />
            
            <label>Conteúdo Principal *</label>
            <input type="text" value={newEvent.conteudo_principal || ''} onChange={e => setNewEvent({...newEvent, conteudo_principal: e.target.value})} />
            
            <label>Conteúdo Secundário</label>
            <input type="text" value={newEvent.conteudo_secundario || ''} onChange={e => setNewEvent({...newEvent, conteudo_secundario: e.target.value})} />
            
            <label>CTA</label>
            <input type="text" value={newEvent.cta || ''} onChange={e => setNewEvent({...newEvent, cta: e.target.value})} />
            
            <label>Perfil *</label>
            <select value={newEvent.profile || ''} onChange={e => setNewEvent({...newEvent, profile: e.target.value as Perfil})}>
              <option value="">Selecione</option>
              {profiles.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <div style={{ marginTop: '1rem' }}>
              <button onClick={saveEvent}>Salvar</button>
              <button style={{ marginLeft: '1rem' }} onClick={() => setModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}