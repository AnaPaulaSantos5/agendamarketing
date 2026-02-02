'use client';
import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import AgendaCalendar, { AgendaEvent, Perfil } from '@/app/components/AgendaCalendar';

type PerfisMap = Record<Perfil, { chatId: string }>;

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfis, setPerfis] = useState<PerfisMap>({});
  const [loading, setLoading] = useState(true);

  const loadAgenda = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(Array.isArray(data.events) ? data.events : []);
      setPerfis(data.perfis || {});
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgenda();
  }, []);

  if (loading) return <div>Carregando agenda…</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <AgendaCalendar
          events={events}
          perfis={perfis}
          onRefresh={loadAgenda}
          isAdmin={true} // se quiser permitir edição
        />
      </div>
      <div style={{ width: 320, borderLeft: '1px solid #ddd' }}>
        {/* Aqui vai seu painel lateral */}
      </div>
    </div>
  );
}
