'use client';
import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import AgendaCalendar, { AgendaEvent, Perfil } from '@/app/components/AgendaCalendar';

/* =======================
TIPOS
======================= */
type PerfilConfig = Record<Perfil, { chatId: string }>;

/* =======================
PÁGINA
======================= */
export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [perfilConfig, setPerfilConfig] = useState<PerfilConfig>({
    Confi: { chatId: '' },
    Cecília: { chatId: '' },
    Luiza: { chatId: '' },
    Júlio: { chatId: '' },
  });
  const [loading, setLoading] = useState(true);

  // 🔹 Carrega agenda e perfis da API
  useEffect(() => {
    async function loadAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        // A API deve retornar { events: AgendaEvent[], perfis: PerfilConfig }
        setEvents(Array.isArray(data.events) ? data.events : []);
        if (data.perfis) {
          setPerfilConfig(prev => ({ ...prev, ...data.perfis }));
        }
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAgenda();
  }, []);

  // 🔹 Salvar chatIds no backend
  const salvarChatIds = async () => {
    try {
      await fetch('/api/agenda', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfilConfig }),
      });
      alert('ChatIDs salvos com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar ChatIDs');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      {loading ? (
        <div className="flex-1 flex items-center justify-center">Carregando agenda…</div>
      ) : (
        <div className="flex flex-1">
          {/* Lateral esquerda para perfis */}
          <div className="w-60 p-4 border-r">
            <h2 className="font-bold mb-2">Perfis</h2>
            {Object.keys(perfilConfig).map((perfil) => (
              <div key={perfil} className="mb-2">
                <label className="block font-semibold">{perfil}</label>
                <input
                  className="w-full border p-1 rounded"
                  placeholder="ChatId"
                  value={perfilConfig[perfil as Perfil].chatId}
                  onChange={(e) =>
                    setPerfilConfig((prev) => ({
                      ...prev,
                      [perfil]: { chatId: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
            <button
              onClick={salvarChatIds}
              className="mt-2 w-full bg-yellow-400 text-black font-bold py-2 rounded"
            >
              Salvar ChatIDs
            </button>
          </div>

          {/* Calendário */}
          <div className="flex-1 p-4">
            <AgendaCalendar
              events={events}
              perfis={perfilConfig}
              onRefresh={() => {
                // Reload simples após salvar/editar
                setLoading(true);
                fetch('/api/agenda')
                  .then((res) => res.json())
                  .then((data) => {
                    setEvents(Array.isArray(data.events) ? data.events : []);
                    if (data.perfis) setPerfilConfig((prev) => ({ ...prev, ...data.perfis }));
                  })
                  .finally(() => setLoading(false));
              }}
              isAdmin={true} // Mostrar chatIds e salvar
            />
          </div>
        </div>
      )}
    </div>
  );
}
