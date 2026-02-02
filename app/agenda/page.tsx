'use client';
import { useState } from 'react';
import AgendaCalendar from './components/AgendaCalendar';
import EventModal from './components/EventModal';

export default function AgendaPage() {
  const [selectedProfile, setSelectedProfile] = useState('Confi');
  const [modalOpen, setModalOpen] = useState(false);

  const profiles = ['Confi', 'Luiza', 'Júlio', 'Cecília'];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Topo: seleção de perfis */}
      <div className="flex items-center p-4 bg-white shadow">
        {profiles.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedProfile(p)}
            className={`px-4 py-2 rounded mr-2 ${
              selectedProfile === p ? 'bg-yellow-500 text-white' : 'bg-gray-200'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Lateral esquerda: cliente + checklist */}
        <div className="w-80 p-4 bg-white flex flex-col gap-4 overflow-y-auto">
          {/* Foto do cliente */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full mb-2" />
            <h2 className="font-bold">Nome do Cliente</h2>
            <p>Email: cliente@email.com</p>
            <p>Telefone: 12345</p>
          </div>

          {/* Checklist */}
          <div>
            <h3 className="font-semibold mb-2">Checklist</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>Revisar documento</li>
              <li>Confirmar reunião</li>
            </ul>
            <button
              onClick={() => alert('Adicionar item (template)')}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
            >
              + Adicionar Evento
            </button>
          </div>
        </div>

        {/* Calendário central */}
        <div className="flex-1 p-4 overflow-auto">
          <AgendaCalendar onAddEvent={() => setModalOpen(true)} />
        </div>

        {/* Lateral direita: Spotify + notificações */}
        <div className="w-80 p-4 bg-white flex flex-col gap-4 overflow-y-auto">
          <div className="bg-gray-200 h-48 flex items-center justify-center">
            Playlist Pública (Spotify)
          </div>
          <div className="flex-1 bg-gray-100 p-2 rounded">
            <h3 className="font-semibold mb-2">Notificações WhatsApp</h3>
            <div className="space-y-1">
              <div className="bg-green-200 p-2 rounded">Mensagem recebida</div>
              <div className="bg-blue-200 p-2 rounded">Mensagem enviada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de evento */}
      {modalOpen && <EventModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}