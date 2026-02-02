'use client';
import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import AgendaCalendar, { AgendaEvent, PerfilConfig } from '@/app/components/AgendaCalendar';

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfilConfig, setPerfilConfig] = useState<PerfilConfig>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        // ⚠️ Garantir que events seja array
        setEvents(Array.isArray(data.events) ? data.events : []);
        setPerfilConfig(data.perfis || {});
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAgenda();
  }, []);

  return (
    <>
      <Header />
      {loading ? (
        <p>Carregando agenda…</p>
      ) : (
        <AgendaCalendar
          events={events}
          perfilConfig={perfilConfig}
          setPerfilConfig={setPerfilConfig}
          onRefresh={async () => {
            setLoading(true);
            const res = await fetch('/api/agenda');
            const data = await res.json();
            setEvents(Array.isArray(data.events) ? data.events : []);
            setPerfilConfig(data.perfis || {});
            setLoading(false);
          }}
          isAdmin={true} // ou false para usuário normal
        />
      )}
    </>
  );
}
