'use client';

import { useEffect, useState } from 'react';
import AgendaLayout from '../components/AgendaLayout';
import { AgendaEvent, ChecklistItem, Perfil } from '../components/types';
import { getEvents, getChecklist } from '../services/agendaService';

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [perfil, setPerfil] = useState<Perfil>('Confi');

  useEffect(() => {
    async function load() {
      setEvents(await getEvents());
      setChecklist(await getChecklist());
    }
    load();
  }, []);

  return (
    <AgendaLayout
      events={events}
      checklist={checklist}
      userPerfil={perfil}
      onPerfilChange={setPerfil}
      userName="Equipe Confi"
      responsavelChatId=""
    />
  );
}
