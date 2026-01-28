'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type Tarefa = {
  titulo: string;
  responsavel: Perfil;
  data: string;
  status: string;
  linkDrive?: string;
  notificar?: string;
};

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
  tarefa?: Tarefa | null;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  // Para visualização e edição
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch inicial da agenda
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

  // Salvar evento (novo ou edição)
  const handleSave = async (event: AgendaEvent, isEdit = false) => {
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch('/api/agenda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error('Erro ao salvar');

      if (isEdit) {
        setEvents(prev =>
          prev.map(e => (e.id === event.id ? { ...e, ...event } : e))
        );
      } else {
        setEvents(prev => [...prev, { ...event, id: String(prev.length + 1) }]);
      }

      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  // Excluir evento
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este evento?')) return;
    try {
      const res = await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erro ao excluir');

      setEvents(prev => prev.filter(e => e.id !== id));
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir evento');
    }
  };

  // Marcar tarefa como concluída / pendente
  const handleChecklistToggle = async (event: AgendaEvent) => {
    if (!event.tarefa) return;
    const newStatus = event.tarefa.status === 'Concluída' ? 'Pendente' : 'Concluída';
    const updatedEvent = { ...event, tarefa: { ...event.tarefa, status: newStatus } };
    await handleSave(updatedEvent, true);
  };

  // Reagendar tarefa/evento (abre modal pré-preenchido)
  const handleReschedule = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  // Para checklist do dia
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {/* Lado esquerdo: Calendário */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 8 }}>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
          }))}
          dateClick={info => {
            setSelectedEvent({
              id: '',
              start: info.dateStr,
              end: info.dateStr,
              perfil: filterProfile,
            });
            setIsModalOpen(true);
          }}
          eventClick={info => {
            const event = events.find(e => e.id === info.event.id);
            if (event) setSelectedEvent(event);
          }}
          selectable
          select={info => {
            setSelectedEvent({
              id: '',
              start: info.startStr,
              end: info.endStr,
              perfil: filterProfile,
            });
            setIsModalOpen(true);
          }}
        />

        {/* Visualização do evento selecionado */}
        {selectedEvent && selectedEvent.id && (
          <div style={{ marginTop: 10, padding: 10, border: '1px solid #ccc', borderRadius: 6 }}>
            <h4>Detalhes do Evento</h4>
            <p><strong>Título:</strong> {selectedEvent.conteudoPrincipal}</p>
            <p><strong>Perfil:</strong> {selectedEvent.perfil}</p>
            <p><strong>Tipo:</strong> {selectedEvent.tipo}</p>
            <p><strong>Tipo de Evento:</strong> {selectedEvent.tipoEvento}</p>
            <p><strong>Data/Hora Início:</strong> {selectedEvent.start}</p>
            <p><strong>Data/Hora Fim:</strong> {selectedEvent.end}</p>
            {selectedEvent.tarefa && (
              <>
                <p><strong>Tarefa:</strong> {selectedEvent.tarefa.titulo}</p>
                <p><strong>Status:</strong> {selectedEvent.tarefa.status}</p>
                <p><strong>Link Drive:</strong> {selectedEvent.tarefa.linkDrive && <a href={selectedEvent.tarefa.linkDrive} target="_blank">Abrir</a>}</p>
              </>
            )}
            <div style={{ display: 'flex', gap: 5, marginTop: 6 }}>
              <button onClick={() => setIsModalOpen(true)}>✏️ Editar</button>
              <button onClick={() => handleDelete(selectedEvent.id)} style={{ color: 'red' }}>🗑️ Excluir</button>
              <button onClick={() => setSelectedEvent(null)}>❌ Fechar</button>
            </div>
          </div>
        )}
      </div>

      {/* Lado direito: Checklist do dia */}
      <div style={{ width: 280, padding: 10, borderLeft: '1px solid #ccc' }}>
        <h4>Checklist Hoje</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {events
            .filter(e => e.tarefa && e.start.slice(0, 10) === todayStr)
            .map(e => (
              <li key={e.id} style={{ marginBottom: 6, borderBottom: '1px solid #eee', paddingBottom: 4 }}>
                <strong>{e.conteudoPrincipal}</strong> - {e.tarefa!.titulo} ({e.tarefa!.status})
                <div style={{ display: 'flex', gap: 5, marginTop: 2 }}>
                  <button onClick={() => handleChecklistToggle(e)}>
                    {e.tarefa!.status === 'Concluída' ? '✅ Desmarcar' : '☑️ Concluir'}
                  </button>
                  <button onClick={() => handleReschedule(e)}>⏰ Reagendar</button>
                  <button onClick={() => handleDelete(e.id)} style={{ color: 'red' }}>🗑️ Excluir</button>
                </div>
              </li>
            ))}
        </ul>
      </div>

      {/* Modal de edição */}
      {selectedEvent && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          onSave={(ev: AgendaEvent) => handleSave(ev, Boolean(ev.id))}
        />
      )}
    </div>
  );
}