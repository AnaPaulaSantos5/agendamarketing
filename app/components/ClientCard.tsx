import React from 'react';

export default function ClientCard() {
  return (
    <div className="p-4 bg-white shadow rounded w-72 flex flex-col gap-4">
      <div className="flex flex-col items-center">
        <img src="/clients/client.png" alt="Cliente" className="w-24 h-24 rounded-full" />
        <h2 className="font-bold mt-2">Nome Cliente</h2>
        <p className="text-sm text-gray-600">cliente@email.com</p>
        <p className="text-sm text-gray-600">12345</p>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">Checklist</h3>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Revisar documento
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Confirmar reunião
        </label>
      </div>
      <button className="mt-2 bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600">
        + Adicionar Evento
      </button>
    </div>
  );
}