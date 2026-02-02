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
  perfilConfig: Record<Perfil, { chatId: string }>;
  isAdmin: boolean;
};

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  start,
  end,
  event,
  perfilConfig,
}: Props) {
  const [perfil, setPerfil] = useState<Perfil>('Confi');
  const [titulo, setTitulo] = useState('');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    if (event) {
      setPerfil(event.perfil || 'Confi');
      setTitulo(event.conteudoPrincipal || '');
      setConteudoSecundario(event.conteudoSecundario || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setStartDate(event.start);
      setEndDate(event.end);
    }
  }, [event, start, end]);

  const handleSave = () => {
    const ev: AgendaEvent = {
      id: event?.id || String(Date.now()),
      start: startDate,
      end: endDate,
      perfil,
      conteudoPrincipal: titulo,
      conteudoSecundario,
      tarefa: {
        titulo,
        responsavel: perfil,
        responsavelChatId: perfilConfig[perfil]?.chatId || '',
        data: startDate,
        status: 'Pendente',
        linkDrive,
        notificar: 'Sim',
      },
    };

    onSave(ev, !!event);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h3>{event ? 'Editar Evento' : 'Novo Evento'}</h3>

      <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)}>
        {['Confi', 'Cecília', 'Luiza', 'Júlio'].map(p => (
          <option key={p}>{p}</option>
        ))}
      </select>

      <input
        placeholder="Título"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
      />

      <textarea
        placeholder="Conteúdo alternativo"
        value={conteudoSecundario}
        onChange={e => setConteudoSecundario(e.target.value)}
      />

      <input
        placeholder="Link do Drive"
        value={linkDrive}
        onChange={e => setLinkDrive(e.target.value)}
      />

      <p>
        <strong>ChatID:</strong>{' '}
        {perfilConfig[perfil]?.chatId || 'NÃO DEFINIDO'}
      </p>

      <button onClick={handleSave}>Salvar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
