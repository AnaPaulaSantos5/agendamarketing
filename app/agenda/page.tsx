'use client';

import { useEffect, useState } from 'react';
import AgendaCalendar, { AgendaEvent, PerfilsMap } from '@/app/components/AgendaCalendar';

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfis, setPerfis] = useState<PerfilsMap>({}); // <--- Corrigido

  const loadAgenda = () => {
    // aqui você pode puxar os dados da planilha e setar
    // exemplo:
    // setEvents([...])
    // setPerfis({...})
  };

  useEffect(() => {
    loadAgenda();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <AgendaCalendar events={events} perfis={perfis} onRefresh={loadAgenda} />
      </div>
      <div style={{ width: 320, borderLeft: '1px solid #ddd' }}>
        {/* Seu componente lateral */}
      </div>
    </div>
  );
}
