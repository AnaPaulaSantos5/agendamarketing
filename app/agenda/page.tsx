'use client';

import { useEffect, useState } from 'react';
import AgendaLayout from '@/app/components/AgendaLayout';
import { AgendaEvent, Perfil } from '@/app/components/types';
import { getEvents } from '@/app/services/agendaService';

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