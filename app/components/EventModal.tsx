'use client';

import React, { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
  onDelete?: (id: string) => void; // ✅ callback para excluir
  start: string;
  end: string;
  event?: AgendaEvent | null;
  userPerfil: Perfil;
  userChatId: string;
  userImage?: string;
  isAdmin: boolean;
  perfilMap: Record<Perfil, { chatId: string; image?: string }>;
  setPerfilMap: React.Dispatch<React.SetStateAction<Record<Perfil, { chatId: string; image?: string }>>>;
  profiles: Perfil[];
};

export default function EventModal({
  isOpen, onClose, onSave, onDelete,
  start, end, event, userPerfil, userChatId, userImage,
  isAdmin, perfilMap, setPerfilMap, profiles
}: Props) {
  const [title, setTitle] = useState('');
  const [perfil, setPerfil] = useState<Perfil>(userPerfil);
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState(userChatId);
  const [perfilImage, setPerfilImage] = useState(userImage);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  // Atualiza campos quando o modal abre ou muda de evento
  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || userPerfil);
      setConteudoSecundario(event.conteudoSecundario || '');
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setResponsavelChatId(event.tarefa?.responsavelChatId || perfilMap[event.perfil || userPerfil]?.chatId || '');
      setPerfilImage(event.tarefa?.userImage || perfilMap[event.perfil || userPerfil]?.image || userImage);
      setStartDate(event.start);
      setEndDate(event.end);
    } else {
      setStartDate(start);
      setEndDate(end);
      setResponsavelChatId(perfilMap[perfil]?.chatId || '');
      setPerfilImage(perfilMap[perfil]?.image || userImage);
    }
  }, [event, start, end, perfil, perfilMap, userPerfil, userImage]);

  // Atualiza chatId e imagem quando muda o perfil
  useEffect(() => {
    setResponsavelChatId(perfilMap[perfil]?.chatId || '');
    setPerfilImage(perfilMap[perfil]?.image || userImage);
  }, [perfil, perfilMap, userImage]);

  if (!isOpen) return null;

  // Salvar evento
  const handleSave = () => {
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
    onSave(ev, !!event);
    onClose();
  };

  // Excluir evento
  const handleDelete = async () => {
    if (!event?.id) return;
    if (onDelete) onDelete(event.id); // Remove do estado e da planilha
    onClose();
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {perfilImage && (
          <img
            src={perfilImage}
            alt={perfil}
            style={{ width: 50, height: 50, borderRadius: '50%', float: 'left', marginRight: 12 }}
          />
        )}
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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button onClick={handleSave}>Salvar</button>
          {event && <button style={{ background: '#e74c3c', color: '#fff' }} onClick={handleDelete}>Excluir</button>}
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 400, borderRadius: 8 };
