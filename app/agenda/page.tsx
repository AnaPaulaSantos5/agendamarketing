'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import AgendaCalendar, { AgendaEvent } from '@/app/components/AgendaCalendar';

/* =======================
Tipos
======================= */
export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type PerfisMap = Record<Perfil, { chatId: string }>;

type ApiResponse = {
  events: AgendaEvent[];
  perfis: PerfisMap;
};

/* =======================
Página
======================= */
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
  Carregar agenda da API
  ====================== */
  useEffect(() => {
    const loadAgenda = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/agenda');
        const data: ApiResponse = await res.json();

        setEvents(Array.isArray(data.events) ? data.events : []);
        setPerfis({ ...perfis, ...data.perfis }); // mantém as chaves existentes
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAgenda();
  }, []);

  /* =======================
  Refresh simples após salvar/editar
  ====================== */
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agenda');
      const data: ApiResponse = await res.json();

      setEvents(Array.isArray(data.events) ? data.events : []);
      setPerfis({ ...perfis, ...data.perfis });
    } catch (err) {
      console.error('Erro ao atualizar agenda:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1 }}>
          {loading ? (
            <p>Carregando agenda…</p>
          ) : (
            <AgendaCalendar
              events={events}
              perfis={perfis}
              onRefresh={handleRefresh}
            />
          )}
        </div>

        {/* Aqui você pode adicionar painel lateral se quiser */}
        <div style={{ width: 320, borderLeft: '1px solid #ddd' }}>
          {/* Exemplo: Checklist lateral ou informações */}
        </div>
      </div>
    </>
  );
}
