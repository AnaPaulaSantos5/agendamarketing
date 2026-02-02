'use client';
import React from 'react';

type EventModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Novo Evento</h2>
        <input className="w-full border p-2 rounded mb-2" placeholder="Título" />
        <input className="w-full border p-2 rounded mb-2" placeholder="Conteúdo secundário" />
        <input className="w-full border p-2 rounded mb-2" placeholder="Link Drive" />
        <select className="w-full border p-2 rounded mb-2">
          <option>Confi</option>
          <option>Luiza</option>
          <option>Júlio</option>
          <option>Cecília</option>
        </select>
        <input className="w-full border p-2 rounded mb-2" type="datetime-local" />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;