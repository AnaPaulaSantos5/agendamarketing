'use client';

import { useEffect, useState } from 'react';
import AgendaCalendar, { AgendaEvent, Perfil, PerfisMap } from '@/app/components/AgendaCalendar';

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfis, setPerfis] = useState<PerfisMap>({
    Confi: { chatId: '' },
    Cecília: { chatId: '' },
    Luiza: { chatId: '' },
    Júlio: { chatId: '' },
  });
  const [loading, setLoading] = useState(true);

  /* =======================
  Carregar eventos da API
  ====================== */
  const loadAgenda = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
      setPerfis(data.perfis || perfis);
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgenda();
  }, []);

  if (loading) return <p>Carregando agenda…</p>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <AgendaCalendar
          events={events}
          perfis={perfis}
          onRefresh={loadAgenda}
        />
      </div>
    </div>
  );
}
