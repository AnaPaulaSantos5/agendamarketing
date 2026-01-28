'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

interface AgendaEvent {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  tipo_evento: string;
  tipo: string;
  conteudo_principal: string;
  conteudo_secundario: string;
  cta: string;
  status_postagem: string;
  perfil: Perfil;
}

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AgendaEvent>>({});

  // Carregar eventos da API
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data.Agenda || []);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  // Salvar novo evento
  const handleSaveEvent = async () => {
    if (
      !formData.start ||
      !formData.end ||
      !formData.tipo_evento ||
      !formData.tipo ||
      !formData.conteudo_principal ||
      !formData.status_postagem ||
      !formData.perfil
    ) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: formData }),
      });
      if (!res.ok) throw new Error('Erro ao salvar evento');
      const saved = await res.json();
      setEvents(prev => [...prev, saved.event]);
      setShowForm(false);
      setFormData({});
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  return (
    <div>
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

        <button
          style={{ marginLeft: '1rem' }}
          onClick={() => setShowForm(true)}
        >
          Adicionar Evento
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <h3>Adicionar Evento</h3>
          <label>
            Data Início:
            <input
              type="date"
              value={formData.start || ''}
              onChange={e => setFormData({ ...formData, start: e.target.value })}
            />
          </label>
          <br />
          <label>
            Data Fim:
            <input
              type="date"
              value={formData.end || ''}
              onChange={e => setFormData({ ...formData, end: e.target.value })}
            />
          </label>
          <br />
          <label>
            Tipo Evento:
            <input
              type="text"
              value={formData.tipo_evento || ''}
              onChange={e => setFormData({ ...formData, tipo_evento: e.target.value })}
            />
          </label>
          <br />
          <label>
            Tipo:
            <input
              type="text"
              value={formData.tipo || ''}
              onChange={e => setFormData({ ...formData, tipo: e.target.value })}
            />
          </label>
          <br />
          <label>
            Conteúdo Principal:
            <input
              type="text"
              value={formData.conteudo_principal || ''}
              onChange={e => setFormData({ ...formData, conteudo_principal: e.target.value })}
            />
          </label>
          <br />
          <label>
            Conteúdo Secundário:
            <input
              type="text"
              value={formData.conteudo_secundario || ''}
              onChange={e => setFormData({ ...formData, conteudo_secundario: e.target.value })}
            />
          </label>
          <br />
          <label>
            CTA:
            <input
              type="text"
              value={formData.cta || ''}
              onChange={e => setFormData({ ...formData, cta: e.target.value })}
            />
          </label>
          <br />
          <label>
            Status Postagem:
            <input
              type="text"
              value={formData.status_postagem || ''}
              onChange={e => setFormData({ ...formData, status_postagem: e.target.value })}
            />
          </label>
          <br />
          <label>
            Perfil:
            <select
              value={formData.perfil || 'Confi'}
              onChange={e => setFormData({ ...formData, perfil: e.target.value as Perfil })}
            >
              {profiles.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <br />
          <button onClick={handleSaveEvent}>Salvar</button>
          <button onClick={() => setShowForm(false)}>Cancelar</button>
        </div>
      )}

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
          title: e.conteudo_principal,
          start: e.start,
          end: e.end,
        }))}
        editable={true}
        selectable={true}
      />
    </div>
  );
}
