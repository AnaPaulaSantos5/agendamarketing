// app/components/AgendaCalendar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

export type AgendaEvent = {
  id: string;
  start: string; // datas sempre como string no padrão 'YYYY-MM-DD HH:mm'
  end: string;
  tipoEvento: string;
  tipo: string;
  conteudoPrincipal: string;
  conteudoSecundario: string;
  cta: string;
  statusPostagem: string;
  perfil: string;
  tarefa?: {
    titulo: string;
    responsavel: string;
    responsavelChatId?: string;
    data: string;
    status: string;
    linkDrive: string;
    notificar: string;
  };
};

const AgendaCalendar = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Buscar eventos da planilha ao carregar
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data: AgendaEvent[] = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Abrir modal para criar novo evento
  const handleDateSelect = (selectInfo: any) => {
    setSelectedEvent({
      id: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      tipoEvento: '',
      tipo: '',
      conteudoPrincipal: '',
      conteudoSecundario: '',
      cta: '',
      statusPostagem: '',
      perfil: '',
      tarefa: {
        titulo: '',
        responsavel: '',
        responsavelChatId: '',
        data: selectInfo.startStr,
        status: 'Pendente',
        linkDrive: '',
        notificar: 'Sim',
      },
    });
    setModalOpen(true);
  };

  // Abrir modal ao clicar em evento
  const handleEventClick = (clickInfo: any) => {
    const ev = events.find(e => e.id === clickInfo.event.id);
    if (ev) {
      setSelectedEvent(ev);
      setModalOpen(true);
    }
  };

  // Salvar ou editar evento
  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    try {
      const method = isEdit ? 'PATCH' : 'POST';
      await fetch('/api/agenda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
      });

      // Atualiza lista local de eventos
      if (isEdit) {
        setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
      } else {
        // Para POST, a API gera o ID. Recarrega todos
        await fetchEvents();
      }

      setModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      alert('Erro ao salvar evento');
    }
  };

  // Deletar evento
  const deleteEvent = async (id: string) => {
    try {
      await fetch('/api/agenda', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setEvents(prev => prev.filter(e => e.id !== id));
      setModalOpen(false);
    } catch (err) {
      console.error('Erro ao deletar evento:', err);
      alert('Erro ao deletar evento');
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        editable={true}
        events={events.map(ev => ({
          id: ev.id,
          title: ev.conteudoPrincipal,
          start: ev.start,
          end: ev.end,
        }))}
        select={handleDateSelect}
        eventClick={handleEventClick}
      />

      {modalOpen && selectedEvent && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedEvent.start}
          end={selectedEvent.end}
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
};

export default AgendaCalendar;
