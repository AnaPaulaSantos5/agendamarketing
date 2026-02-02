'use client';

import { useEffect, useState } from 'react';
import { AgendaEvent } from './AgendaCalendar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: AgendaEvent | null;
  isAdmin: boolean;
  userChatId: string;
  userPerfil: string;
  userImage: string;
  onSaved: () => void;
}

export default function EventModal({
  isOpen,
  onClose,
  event,
  isAdmin,
  userChatId,
  userPerfil,
  userImage,
  onSaved
}: Props) {
  const [title, setTitle] = useState('');
  const [perfil, setPerfil] = useState('');
  const [tipo, setTipo] = useState<'Interno' | 'Perfil'>('Perfil');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [cta, setCta] = useState('');
  const [statusPostagem, setStatusPostagem] = useState('');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState('');
  const [perfilImage, setPerfilImage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || userPerfil);
      setTipo(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setConteudoSecundario(event.conteudoSecundario || '');
      setCta(event.cta || '');
      setStatusPostagem(event.statusPostagem || '');
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setResponsavelChatId(
        event.tarefa?.responsavelChatId || userChatId || ''
      );
      setPerfilImage(event.tarefa?.userImage || userImage);
      setStartDate(event.start || '');
      setEndDate(event.end || '');
    } else {
      setResponsavelChatId(userChatId || '');
      setPerfilImage(userImage);
      setPerfil(userPerfil);
    }
  }, [event, isOpen, userChatId, userImage, userPerfil]);

  if (!isOpen) return null;

  async function handleSave() {
    const payload = {
      id: event?.id,
      conteudoPrincipal: title,
      conteudoSecundario,
      cta,
      statusPostagem,
      perfil,
      tipoEvento: tipo,
      start: startDate,
      end: endDate,
      tarefa: {
        titulo: tarefaTitle,
        responsavelChatId,
        linkDrive,
        userImage: perfilImage
      }
    };

    await fetch('/api/agenda', {
      method: event ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    onSaved();
    onClose();
  }

  return (
    <div className="modal">
      <h2>{event ? 'Editar Evento' : 'Novo Evento'}</h2>

      <input
        placeholder="Título"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      {isAdmin && (
        <input
          placeholder="Responsável Chat ID"
          value={responsavelChatId}
          onChange={e => setResponsavelChatId(e.target.value)}
        />
      )}

      <input
        placeholder="Conteúdo secundário"
        value={conteudoSecundario}
        onChange={e => setConteudoSecundario(e.target.value)}
      />

      <input
        placeholder="CTA"
        value={cta}
        onChange={e => setCta(e.target.value)}
      />

      <input
        placeholder="Status"
        value={statusPostagem}
        onChange={e => setStatusPostagem(e.target.value)}
      />

      <input
        placeholder="Tarefa"
        value={tarefaTitle}
        onChange={e => setTarefaTitle(e.target.value)}
      />

      <input
        placeholder="Link Drive"
        value={linkDrive}
        onChange={e => setLinkDrive(e.target.value)}
      />

      <input
        type="datetime-local"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
      />

      <input
        type="datetime-local"
        value={endDate}
        onChange={e => setEndDate(e.target.value)}
      />

      <button onClick={handleSave}>Salvar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
