"use client";

import { useEffect, useState } from "react";
import { AgendaEvent, Perfil } from "./AgendaCalendar";

type PerfilConfig = Record<Perfil, { chatId: string }>;

interface Props {
  event: AgendaEvent | null;
  start: string;
  end: string;
  perfilConfig: PerfilConfig;
  onSave: (data: AgendaEvent) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({
  event,
  start,
  end,
  perfilConfig,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [conteudoPrincipal, setConteudoPrincipal] = useState("");
  const [conteudoSecundario, setConteudoSecundario] = useState("");
  const [perfil, setPerfil] = useState<Perfil>("Confi");
  const [dataInicio, setDataInicio] = useState(start);
  const [dataFim, setDataFim] = useState(end);
  const [linkDrive, setLinkDrive] = useState("");

  useEffect(() => {
    if (event) {
      setConteudoPrincipal(event.conteudoPrincipal);
      setConteudoSecundario(event.conteudoSecundario || "");
      setPerfil(event.perfil);
      setDataInicio(event.start);
      setDataFim(event.end || event.start);
      setLinkDrive(event.tarefa?.linkDrive || "");
    }
  }, [event]);

  function salvar() {
    onSave({
      id: event?.id || "",
      start: dataInicio,
      end: dataFim,
      conteudoPrincipal,
      conteudoSecundario,
      perfil,
      tarefa: {
        responsavelChatId: perfilConfig[perfil].chatId,
        linkDrive,
      },
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)" }}>
      <div style={{ background: "#fff", padding: 20, width: 420, margin: "80px auto" }}>
        <h3>{event ? "Editar Evento" : "Novo Evento"}</h3>

        <input
          placeholder="Conteúdo principal"
          value={conteudoPrincipal}
          onChange={e => setConteudoPrincipal(e.target.value)}
        />

        <input
          placeholder="Conteúdo secundário"
          value={conteudoSecundario}
          onChange={e => setConteudoSecundario(e.target.value)}
        />

        <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)}>
          {Object.keys(perfilConfig).map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <small>ChatId: {perfilConfig[perfil].chatId || "N/A"}</small>

        <input type="datetime-local" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
        <input type="datetime-local" value={dataFim} onChange={e => setDataFim(e.target.value)} />

        <input
          placeholder="Link do Drive"
          value={linkDrive}
          onChange={e => setLinkDrive(e.target.value)}
        />

        <div style={{ marginTop: 12 }}>
          <button onClick={salvar}>Salvar</button>

          {event && (
            <button style={{ marginLeft: 8 }} onClick={() => onDelete(event.id)}>
              Excluir
            </button>
          )}

          <button style={{ marginLeft: 8 }} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
