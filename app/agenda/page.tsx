'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import AgendaCalendar from '@/app/components/AgendaCalendar';

/* =======================
   Tipos
======================= */

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento: string;
  tipo: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil: string;
  tarefa?: {
    titulo: string;
    responsavel: string;
    responsavelChatId?: string;
    data?: string;
    status?: string;
    linkDrive?: string;
    notificar?: string;
  } | null;
};

type PerfisMap = Record<string, string>; // { Confi: chatId, Luiza: chatId, ... }

/* =======================
   Página
======================= */

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfis, setPerfis] = useState<PerfisMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();

        // 🔥 AQUI ESTAVA O ERRO h.map
        setEvents(Array.isArray(data.events) ? data.events : []);
        setPerfis(data.perfis || {});
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
        <div className="p-6 text-gray-500">Carregando agenda…</div>
      ) : (
        <AgendaCalendar
          events={events}
          perfis={perfis}
          onRefresh={() => {
            // reload simples após salvar/editar
            setLoading(true);
            fetch('/api/agenda')
              .then(res => res.json())
              .then(data => {
                setEvents(Array.isArray(data.events) ? data.events : []);
                setPerfis(data.perfis || {});
              })
              .finally(() => setLoading(false));
          }}
        />
      )}
    </>
  );
}
