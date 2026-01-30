'use client';
import React, { useState, useEffect } from 'react';
import { AgendaEvent } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  start: string;
  end: string;
  event: AgendaEvent;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const EventModal: React.FC<Props> = ({ isOpen, onClose, start, end, event, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [conteudoPrincipal, setConteudoPrincipal] = useState('');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [cta, setCta] = useState('');
  const [perfil, setPerfil] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.tipoEvento || '');
      setConteudoPrincipal(event.conteudoPrincipal || '');
      setConteudoSecundario(event.conteudoSecundario || '');
      setCta(event.cta || '');
      setPerfil(event.perfil || '');
      setResponsavelChatId(event.tarefa?.responsavel || '');
      setEditing(false);
    } else {
      setTitle('');
      setConteudoPrincipal('');
      setConteudoSecundario('');
      setCta('');
      setPerfil('');
      setResponsavelChatId('');
      setEditing(false);
    }
  }, [event]);

  const handleSave = async () => {
    const updatedEvent: AgendaEvent = {
      ...event,
      tipoEvento: title,
      conteudoPrincipal,
      conteudoSecundario,
      cta,
      perfil,
      tarefa: {
        ...event.tarefa,
        responsavel: responsavelChatId,
      },
      start,
      end,
    };
    await onSave(updatedEvent, editing);
    onClose();
  };

  const handleDelete = async () => {
    if (event?.id) {
      await onDelete(event.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{editing ? 'Editar Evento' : 'Novo Evento'}</h2>
        <label>
          Tipo de Evento:
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Conteúdo Principal:
          <input type="text" value={conteudoPrincipal} onChange={(e) => setConteudoPrincipal(e.target.value)} />
        </label>
        <label>
          Conteúdo Secundário:
          <input type="text" value={conteudoSecundario} onChange={(e) => setConteudoSecundario(e.target.value)} />
        </label>
        <label>
          CTA:
          <input type="text" value={cta} onChange={(e) => setCta(e.target.value)} />
        </label>
        <label>
          Perfil:
          <input type="text" value={perfil} onChange={(e) => setPerfil(e.target.value)} />
        </label>
        <label>
          Responsável Chat ID:
          <input type="text" value={responsavelChatId} onChange={(e) => setResponsavelChatId(e.target.value)} />
        </label>
        <div className="modal-actions">
          <button onClick={handleSave}>Salvar</button>
          {editing && <button onClick={handleDelete}>Excluir</button>}
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
