'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Perfil, AgendaEvent, ChecklistItem } from '../components/types';

// Paleta da sua marca
const profileColors: Record<Perfil, string> = {
  Confi: '#ffce0a',
  Luiza: '#1260c7',
  Cecília: '#f5886c',
  Júlio: '#000000',
};

// Mock de eventos
const mockEvents: AgendaEvent[] = [
  {
    id: '1',
    start: '2026-02-01T10:00:00',
    end: '2026-02-01T12:00:00',
    conteudoPrincipal: 'Reunião Produto A',
    perfil: 'Confi',
  },
  {
    id: '2',
    start: '2026-02-02T14:00:00',
    end: '2026-02-02T15:00:00',
    conteudoPrincipal: 'Gravação Vídeo',
    perfil: 'Luiza',
  },
  {
    id: '3',
    start: '2026-02-03T09:00:00',
    end: '2026-02-03T11:00:00',
    conteudoPrincipal: 'Planejamento Social',
    perfil: 'Cecília',
  },
];

// Mock checklist
const mockChecklist: ChecklistItem[] = [
  { id: 'c1', date: '2026-02-01', client: 'Cliente A', task: 'Enviar proposta', done: false },
  { id: 'c2', date: '2026-02-01', client: 'Cliente B', task: 'Reunião Kickoff', done: true },
];

// Perfis disponíveis
const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>(mockEvents);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(mockChecklist);
  const [userPerfil, setUserPerfil] = useState<Perfil>('Confi');

  // Seleção de eventos no calendário
  const handleEventClick = (info: any) => {
    alert(`Evento: ${info.event.title}`);
  };

  // Concluir tarefa do checklist
  const toggleChecklist = (id: string) => {
    setChecklist(prev =>
      prev.map(item => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Lateral esquerda */}
      <div style={{ width: 250, padding: 16, borderRight: '1px solid #ddd' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              margin: '0 auto',
              borderRadius: '50%',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 4px rgba(0,0,0,0.3)',
              cursor: 'pointer',
            }}
            title="Clique para ver perfil"
          >
            <img
              src="/user-placeholder.png"
              alt="Usuário"
              style={{ width: 70, height: 70, borderRadius: '50%' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Trocar Perfil:{' '}
            <select value={userPerfil} onChange={e => setUserPerfil(e.target.value as Perfil)}>
              {profiles.map(p => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginBottom: 24 }}>
          <strong>Nome:</strong> {userPerfil} <br />
          <strong>ResponsávelChatId:</strong> 5599999999 <br />
          <strong>Especificações:</strong>
          <ul style={{ paddingLeft: 16 }}>
            <li>Produto A</li>
            <li>Produto B</li>
            <li>Conteúdo do dia</li>
          </ul>
        </div>

        <div>
          <strong>Checklist do dia</strong>
          <ul style={{ paddingLeft: 16 }}>
            {checklist.map(item => (
              <li key={item.id}>
                {item.task} ({item.client}){' '}
                <button onClick={() => toggleChecklist(item.id)}>
                  {item.done ? '✅' : '❌'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Calendário */}
      <div style={{ flex: 1, padding: 16 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          editable
          selectable
          events={events.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
            color: ev.perfil ? profileColors[ev.perfil] : '#999',
          }))}
          eventClick={handleEventClick}
        />
      </div>

      {/* Lateral direita — apenas calendário de fundo ou Spotify/WhatsApp futuramente */}
      <div style={{ width: 150, padding: 16, borderLeft: '1px solid #ddd' }}>
        <p>Área futura: Spotify / WhatsApp</p>
      </div>
    </div>
  );
}