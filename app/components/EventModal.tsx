'use client';

import React, { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
  onDelete: (id: string) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
  userPerfil: Perfil;
  userChatId: string;
  isAdmin: boolean;
  perfilConfig: Record<Perfil, { chatId: string; image: string }>;
};

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  start,
  end,
  event,
  userPerfil,
  userChatId,
  perfilConfig,
}: Props) {
  const [titulo, setTitulo] = useState('');
  const [perfil, setPerfil] = useState<Perfil>(userPerfil);
  const [responsavelChatId, setResponsavelChatId] = useState(userChatId);

  useEffect(() => {
    if (event) {
      setTitulo(event.conteudoPrincipal || '');
      setPerfil(event.perfil || userPerfil);
      setResponsavelChatId(
        event.tarefa?.responsavelChatId || perfilConfig[event.perfil || userPerfil].chatId
      );
    } else {
      setResponsavelChatId(perfilConfig[perfil].chatId);
    }
  }, [event, perfil, perfilConfig, userPerfil]);

  if (!isOpen) return null;

  const handleSave = () => {
    const ev: AgendaEvent = {
      id: event?.id || String(Date.now()),
      start,
      end,
      conteudoPrincipal: titulo,
      perfil,
      tarefa: {
        titulo,
        responsavel: perfil,
        responsavelChatId,
        data: start,
        status: 'Pendente',
      },
    };

    onSave(ev, !!event);
    onClose();
  };

  return (
    <div style={{ background: '#fff', padding: 20, border: '1px solid #ccc' }}>
      <h3>{event ? 'Editar Evento' : 'Novo Evento'}</h3>

      <input
        placeholder="Título"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
      />

      <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)}>
        {(['Confi', 'Cecília', 'Luiza', 'Júlio'] as Perfil[]).map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <input
        placeholder="ChatId responsável"
        value={responsavelChatId}
        onChange={e => setResponsavelChatId(e.target.value)}
      />

      <button onClick={handleSave}>Salvar</button>
      {event && <button onClick={() => onDelete(event.id)}>Excluir</button>}
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
