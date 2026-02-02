// app/agenda/page.tsx
"use client";

import { useState } from "react";

type Perfil = {
  nome: string;
  foto: string;
  telefone: string;
};

type EventoModalState = {
  aberto: boolean;
  titulo: string;
  conteudo: string;
  link: string;
  perfilSelecionado: Perfil | null;
  dataInicio: string;
  dataFim: string;
  cor: string;
};

const perfis: Perfil[] = [
  { nome: "Confi", foto: "/perfis/confi.png", telefone: "0000" },
  { nome: "Luiza", foto: "/perfis/luiza.png", telefone: "1111" },
  { nome: "Júlio", foto: "/perfis/julio.png", telefone: "2222" },
  { nome: "Cecília", foto: "/perfis/cecilia.png", telefone: "3333" },
];

const coresMarca = ["#ffce0a", "#1260c7", "#f5886c", "#00c7b7"];

export default function AgendaPage() {
  const [modal, setModal] = useState<EventoModalState>({
    aberto: false,
    titulo: "",
    conteudo: "",
    link: "",
    perfilSelecionado: null,
    dataInicio: "",
    dataFim: "",
    cor: coresMarca[0],
  });

  const [perfilTopo, setPerfilTopo] = useState<Perfil>(perfis[0]);

  return (
    <div className="h-screen flex flex-col">
      {/* Topo com seleção de perfis */}
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
        <h1 className="text-xl font-bold">Agenda</h1>
        <div className="flex space-x-2">
          {perfis.map((p) => (
            <button
              key={p.nome}
              className={`px-3 py-1 rounded ${
                perfilTopo.nome === p.nome ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setPerfilTopo(p)}
            >
              {p.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Lateral esquerda */}
        <div className="w-80 bg-gray-50 p-4 flex flex-col gap-4 overflow-y-auto border-r">
          <div className="flex flex-col items-center">
            <img src="/cliente.png" className="w-24 h-24 rounded-full" />
            <h2 className="mt-2 font-bold">Nome Cliente</h2>
            <p>Email: cliente@email.com</p>
            <p>Telefone: 12345</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Checklist</h3>
            <ul className="flex flex-col gap-1">
              <li>
                <input type="checkbox" /> Revisar documento
              </li>
              <li>
                <input type="checkbox" /> Confirmar reunião
              </li>
            </ul>
            <button
              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
              onClick={() =>
                setModal({ ...modal, aberto: true, titulo: "", conteudo: "" })
              }
            >
              + Adicionar Evento
            </button>
          </div>
        </div>

        {/* Calendário central */}
        <div className="flex-1 p-4 bg-white">
          <div className="w-full h-full border rounded p-4 bg-gray-50 flex flex-col items-center justify-center">
            <p className="text-gray-400 text-lg">Calendário (template visual)</p>
          </div>
        </div>

        {/* Lateral direita */}
        <div className="w-80 bg-gray-50 p-4 flex flex-col gap-4 border-l">
          <h3 className="font-semibold mb-2">Spotify (template)</h3>
          <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
            Playlist Pública
          </div>
          <div className="mt-auto">
            <h3 className="font-semibold mb-2">Notificações WhatsApp</h3>
            <div className="flex flex-col gap-2">
              <div className="bg-green-200 p-2 rounded">Mensagem recebida</div>
              <div className="bg-blue-200 p-2 rounded">Mensagem enviada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Evento */}
      {modal.aberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96 flex flex-col gap-2">
            <h2 className="text-lg font-bold">Evento</h2>
            <input
              type="text"
              placeholder="Título"
              value={modal.titulo}
              onChange={(e) => setModal({ ...modal, titulo: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <textarea
              placeholder="Conteúdo"
              value={modal.conteudo}
              onChange={(e) => setModal({ ...modal, conteudo: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Link Drive"
              value={modal.link}
              onChange={(e) => setModal({ ...modal, link: e.target.value })}
              className="border p-2 rounded w-full"
            />
            <select
              value={modal.perfilSelecionado?.nome || ""}
              onChange={(e) =>
                setModal({
                  ...modal,
                  perfilSelecionado:
                    perfis.find((p) => p.nome === e.target.value) || null,
                })
              }
              className="border p-2 rounded w-full"
            >
              <option value="">Selecionar Perfil</option>
              {perfis.map((p) => (
                <option key={p.nome} value={p.nome}>
                  {p.nome} ({p.telefone})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={modal.dataInicio}
                onChange={(e) => setModal({ ...modal, dataInicio: e.target.value })}
                className="border p-2 rounded flex-1"
              />
              <input
                type="datetime-local"
                value={modal.dataFim}
                onChange={(e) => setModal({ ...modal, dataFim: e.target.value })}
                className="border p-2 rounded flex-1"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {coresMarca.map((c) => (
                <button
                  key={c}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 ${
                    modal.cor === c ? "border-black" : "border-transparent"
                  }`}
                  onClick={() => setModal({ ...modal, cor: c })}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={() => setModal({ ...modal, aberto: false })}
              >
                Cancelar
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => setModal({ ...modal, aberto: false })}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}