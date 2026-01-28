'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';
type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
};

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<AgendaEvent>>({});
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error('Erro da API:', err);
      }
    }
    fetchAgenda();
  }, []);

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  const handleDateClick = (info: any) => {
    setFormData({ start: info.dateStr, end: info.dateStr });
    setFormVisible(true);
  };

  const handleSave = async (data: Partial<AgendaEvent>) => {
    if (!data.start || !data.end || !data.tipoEvento || !data.tipo || !data.conteudoPrincipal || !data.perfil) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      const json = await res.json();
      setEvents(prev => [...prev, { ...data, id: String(json.event._rowNumber) } as AgendaEvent]);
      setFormVisible(false);
      setFormData({});
    } catch (err) {
      console.error('Erro ao salvar evento', err);
      alert('Erro ao salvar evento');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erro ao deletar');
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erro ao deletar evento');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: `${ev.tipo}: ${ev.conteudoPrincipal}`,
            start: ev.start,
            end: ev.end,
          }))}
          dateClick={handleDateClick}
        />
      </div>

      {formVisible && (
        <EventModal
          isOpen={formVisible}
          onClose={() => { setFormVisible(false); setFormData({}); }}
          onSave={handleSave}
          start={formData.start || ''}
          end={formData.end || ''}
        />
      )}

      <div style={{ width: 300, marginLeft: 10 }}>
        <h3>Checklist do dia</h3>
        {filteredEvents
          .filter(e => new Date(e.start).toDateString() === new Date().toDateString())
          .map(ev => (
            <div key={ev.id}>
              {ev.tipo}: {ev.conteudoPrincipal}
              <button onClick={() => handleDelete(ev.id!)}>Excluir</button>
            </div>
          ))}
      </div>
    </div>
  );
}
