'use client';
import React, { useState } from 'react';
import EventModal from './EventModal';

const AgendaCalendar: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Lateral esquerda */}
      <div className="w-72 border-r p-4 flex flex-col gap-4">
        {/* Foto + dados */}
        <div className="flex flex-col items-center">
          <img src="/user-placeholder.png" alt="Foto cliente" className="w-24 h-24 rounded-full mb-2" />
          <h3 className="font-bold">Nome Cliente</h3>
          <p>Email: cliente@email.com</p>
          <p>Telefone: 12345</p>
        </div>

        {/* Checklist */}
        <div className="flex-1">
          <h4 className="font-semibold mb-2">Checklist</h4>
          <ul className="list-disc list-inside">
            <li>Revisar documento</li>
            <li>Confirmar reunião</li>
          </ul>
          <button
            className="mt-2 px-2 py-1 bg-blue-600 text-white rounded"
            onClick={() => setModalOpen(true)}
          >
            + Adicionar Evento
          </button>
        </div>
      </div>

      {/* Calendário (template visual) */}
      <div className="flex-1 p-4 flex justify-center items-center border">
        <div className="h-full w-full border rounded flex justify-center items-center text-gray-400">
          <p>Calendário Template Visual</p>
        </div>
      </div>

      {/* Lateral direita */}
      <div className="w-80 border-l p-4 flex flex-col gap-4">
        <h4 className="font-semibold">Spotify</h4>
        <div className="h-64 border rounded flex justify-center items-center text-gray-400">
          <p>Playlist Pública</p>
        </div>

        <h4 className="font-semibold mt-4">Notificações WhatsApp</h4>
        <div className="flex flex-col gap-2">
          <div className="bg-green-200 p-2 rounded">Mensagem recebida</div>
          <div className="bg-blue-200 p-2 rounded">Mensagem enviada</div>
        </div>
      </div>

      {/* Modal */}
      <EventModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default AgendaCalendar;