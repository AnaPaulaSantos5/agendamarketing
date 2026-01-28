import React from 'react';
import AgendaCalendar from '../components/AgendaCalendar';

export default function AgendaPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Agenda de Conteúdos</h1>
      <AgendaCalendar />
    </div>
  );
}