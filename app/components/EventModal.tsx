'use client';

import React, { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
  userPerfil: Perfil;
  userChatId: string;
  userImage?: string;
  isAdmin: boolean;
  perfilMap: Record<Perfil, { chatId: string; image?: string }>;
  setPerfilMap: React.Dispatch<
    React.SetStateAction<Record<Perfil, { chatId: string; image?: string }>>
  >;
  profiles: Perfil[];
};

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  start,
  end,
  event,
  userPerfil,
  userChatId,
  userImage,
  isAdmin,
  perfilMap,
  profiles,
}: Props) {
  const [titulo, setTitulo] = useState('');
  const [perfil, setPerfil] = useState<Perfil>(userPerfil);
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [tarefaTitulo, setTarefaTitulo] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState('');
  const [inicio, setInicio] = useState(start);
  const [fim, setFim] = useState(end);

  /* 🔹 Preenche dados */
  useEffect(() => {
    if (event) {
      setTitulo(event.conteudoPrincipal || '');
      setPerfil(event.perfil || userPerfil);
      setConteudoSecundario(event.conteudoSecundario || '');
      setTarefaTitulo(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setInicio(event.start);
      setFim(event.end);
    } else {
      setInicio(start);
      setFim(end);
    }
  }, [event, start, end, userPerfil]);

  /* 🔹 Atualiza ChatId sempre pelo perfil */
  useEffect(() => {
    setResponsavelChatId(perfilMap[perfil]?.chatId || '');
  }, [perfil, perfilMap]);

  if (!isOpen) return null;

  /* 🔹 Salvar */
  const handleSave = async () => {
    const ev: AgendaEvent = {
      id: event?.id || String(Date.now()),
      start: inicio,
      end: fim,
      conteudoPrincipal: titulo,
      conteudoSecundario,
      perfil,
      tarefa: tarefaTitulo
        ? {
            titulo: tarefaTitulo,
            responsavel: perfil,
            responsavelChatId,
            data: inicio,
            status: 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : null,
    };

    await fetch('/api/agenda', {
      method: event ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    });

    onSave(ev, !!event);
    onClose();
  };

  /* 🔹 Excluir */
  const handleDelete = async () => {
    if (!event) return;
    const ok = confirm('Tem certeza que deseja excluir este evento?');
    if (!ok) return;

    await fetch('/api/agenda', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: event.id }),
    });

    onClose();
    window.location.reload();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{event ? 'Editar evento' : 'Novo evento'}</h3>

        <label>Perfil responsável</label>
        <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)}>
          {profiles.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <label>Título</label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} />

        <label>Conteúdo secundário</label>
        <textarea
          value={conteudoSecundario}
          onChange={e => setConteudoSecundario(e.target.value)}
        />

        <label>Tarefa</label>
        <input
          value={tarefaTitulo}
          onChange={e => setTarefaTitulo(e.target.value)}
        />

        <label>ChatId responsável</label>
        <input value={responsavelChatId} disabled />

        <label>Link Drive</label>
        <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)} />

        <label>Início</label>
        <input
          type="datetime-local"
          value={inicio}
          onChange={e => setInicio(e.target.value)}
        />

        <label>Fim</label>
        <input
          type="datetime-local"
          value={fim}
          onChange={e => setFim(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={handleSave}>Salvar</button>
          {event && (
            <button
              onClick={handleDelete}
              style={{ background: '#e74c3c', color: '#fff' }}
            >
              Excluir evento
            </button>
          )}
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 420,
  borderRadius: 8,
};
