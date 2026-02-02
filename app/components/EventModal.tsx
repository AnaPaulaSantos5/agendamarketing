'use client';

import React, { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  event?: AgendaEvent | null;
  start: string;
  end: string;
  userPerfil: Perfil;
  userChatId: string;
  userImage?: string;
  isAdmin: boolean;
  perfilMap: Record<Perfil, { chatId: string; image?: string }>;
  setPerfilMap: React.Dispatch<React.SetStateAction<Record<Perfil, { chatId: string; image?: string }>>>;
  profiles: Perfil[];
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
};

export default function EventModal({
  isOpen, onClose, event, start, end,
  userPerfil, userChatId, userImage, isAdmin,
  perfilMap, setPerfilMap, profiles, onSave
}: Props) {
  const [title, setTitle] = useState('');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [perfil, setPerfil] = useState<Perfil>(userPerfil);
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState(userChatId);
  const [perfilImage, setPerfilImage] = useState(userImage);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setConteudoSecundario(event.conteudoSecundario || '');
      setPerfil(event.perfil || userPerfil);
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setResponsavelChatId(event.tarefa?.responsavelChatId || perfilMap[event.perfil || userPerfil].chatId);
      setPerfilImage(event.tarefa?.userImage || perfilMap[event.perfil || userPerfil].image || userImage);
      setStartDate(event.start);
      setEndDate(event.end);
    } else {
      setStartDate(start);
      setEndDate(end);
      setResponsavelChatId(perfilMap[perfil].chatId);
      setPerfilImage(perfilMap[perfil].image || userImage);
    }
  }, [event, start, end, perfil, perfilMap, userPerfil, userImage]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      const ev: AgendaEvent = {
        id: event?.id || String(Date.now()),
        start: startDate,
        end: endDate,
        conteudoPrincipal: title,
        conteudoSecundario,
        perfil,
        tarefa: tarefaTitle
          ? {
              titulo: tarefaTitle,
              responsavel: perfil,
              responsavelChatId,
              userImage: perfilImage,
              data: startDate,
              status: 'Pendente',
              linkDrive,
              notificar: 'Sim',
            }
          : null,
      };

      // Chama API para criar ou atualizar
      const method = event ? 'PATCH' : 'POST';
      const url = '/api/agenda';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
      });

      onSave(ev, !!event);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      alert('Erro ao salvar evento!');
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {perfilImage && <img src={perfilImage} alt={perfil} style={{ width: 50, height: 50, borderRadius: '50%', float: 'left', marginRight: 12 }} />}
        <h3>{event ? 'Editar Evento' : 'Novo Evento'}</h3>

        <label>Perfil responsável:</label>
        <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)}>
          {profiles.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" />
        <textarea value={conteudoSecundario} onChange={e => setConteudoSecundario(e.target.value)} placeholder="Conteúdo secundário" />
        <input value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} placeholder="Tarefa" />
        <input value={responsavelChatId} placeholder="Responsável Chat ID" disabled />
        <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)} placeholder="Link do Drive" />

        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 400, borderRadius: 8 };