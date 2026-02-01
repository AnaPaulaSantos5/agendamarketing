'use client';

import { useEffect, useState } from 'react';
import AgendaLayout from '../components/AgendaLayout';
import { AgendaEvent, Perfil } from '../components/types';
import { getEvents } from './agendaService';

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfil, setPerfil] = useState<Perfil>('Confi');

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(console.error);
  }, []);

  return (
    <AgendaLayout
      events={events}
      userPerfil={perfil}
      userName="Equipe Confi"
      responsavelChatId=""
    />
  );
}