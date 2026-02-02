'use client';
import React, { useEffect, useState } from 'react';
import FullCalendar, { EventClickArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end?: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  linkDrive?: string;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    responsavelChatId?: string;
    data?: string;
    status?: string;
    linkDrive?: string;
    notificar?: string;
  } | null;
};

export type PerfilConfig = Record<Perfil, { chatId: string }>;

interface Props {
  events: AgendaEvent[];
  perfilConfig: PerfilConfig;
  setPerfilConfig: (v: PerfilConfig) => void;
  onRefresh: () => void;
  isAdmin?: boolean;
}

const PERFIS: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar({ events, perfilConfig, setPerfilConfig, onRefresh, isAdmin = false }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState({ start: '', end: '' });

  const perfilColors: Record<Perfil, string> = {
    Confi: '#ffce0a',
    Cecília: '#f5886c',
    Luiza: '#1260c7',
    Júlio: '#00b894',
  };

  const handleSelect = (info: any) => {
    setSelectedEvent(null);
    setSelectedDate({ start: info.startStr, end: info.endStr });
    setIsOpen(true);
  };

  const handleEventClick = (click: EventClickArg) => {
    const ev = events.find(e => e.id === click.event.id);
    if (ev) {
      setSelectedEvent(ev);
      setSelectedDate({ start: ev.start, end: ev.end || '' });
      setIsOpen(true);
    }
  };

  const handleSave = async (ev: AgendaEvent) => {
    const method = ev.id ? 'PATCH' : 'POST';
    await fetch('/api/agenda', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });
    onRefresh();
    setIsOpen(false);
    setSelectedEvent(null);
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    onRefresh();
    setIsOpen(false);
    setSelectedEvent(null);
  };

  const salvarChatIds = async () => {
    await fetch('/api/agenda', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfilConfig }),
    });
    alert('ChatIDs salvos!');
    onRefresh();
  };

  return (
    <div className="flex gap-4">
      {/* LATERAL PERFIS */}
      {isAdmin && (
        <div className="w-48 border p-2 rounded space-y-2">
          <h3 className="font-bold">Perfis</h3>
          {PERFIS.map(perfil => (
            <div key={perfil}>
              <label>{perfil}</label>
              <input
                className="w-full border p-1 rounded"
                placeholder="ChatId"
                value={perfilConfig[perfil]?.chatId || ''}
                onChange={e =>
                  setPerfilConfig({ ...perfilConfig, [perfil]: { chatId: e.target.value } })
                }
              />
            </div>
          ))}
          <button className="mt-2 bg-blue-500 text-white px-4 py-1 rounded" onClick={salvarChatIds}>
            Salvar ChatIDs
          </button>
        </div>
      )}

      {/* CALENDÁRIO */}
      <div className="flex-1">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable
          select={handleSelect}
          eventClick={handleEventClick}
          events={events.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
            backgroundColor: ev.perfil ? perfilColors[ev.perfil] : '#ccc',
          }))}
          height="auto"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
        />
      </div>

      {isOpen && (
        <EventModal
          event={selectedEvent}
          date={selectedEvent ? null : selectedDate.start}
          perfis={PERFIS.map(p => ({ nome: p, chatId: perfilConfig[p]?.chatId || '' }))}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
