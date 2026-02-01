'use client';

import React, { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
  userPerfil: Perfil;
  userChatId: string;
  userImage?: string;
  isAdmin: boolean;
  perfilMap: Record<Perfil, { chatId: string; image?: string }>;
  setPerfilMap: React.Dispatch<React.SetStateAction<Record<Perfil, { chatId: string; image?: string }>>>;
  savePerfil: (perfil: Perfil) => void; // ✅ função para salvar
};

export default function EventModal({
  isOpen, onClose, onSave, start, end, event, userPerfil, userChatId, userImage, isAdmin, perfilMap, setPerfilMap, savePerfil
}: Props) {
  const [title, setTitle] = useState('');
  const [perfil, setPerfil] = useState<Perfil>(userPerfil);
  const [responsavelChatId, setResponsavelChatId] = useState(userChatId);
  const [perfilImage, setPerfilImage] = useState(userImage);
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || userPerfil);
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
  }, [event, start, end, perfilMap, userPerfil, userImage, perfil]);

  useEffect(() => {
    setResponsavelChatId(perfilMap[perfil].chatId);
    setPerfilImage(perfilMap[perfil].image || userImage);
  }, [perfil, perfilMap, userImage]);

  if (!isOpen) return null;

  const handleSave = () => {
    const ev: AgendaEvent = {
      id: event?.id || String(Date.now()),
      start: startDate,
      end: endDate,
      conteudoPrincipal: title,
      perfil,
      tarefa: {
        titulo: title,
        responsavel: perfil,
        responsavelChatId,
        userImage: perfilImage,
        data: startDate,
        status: 'Pendente',
      },
    };
    onSave(ev);
    onClose();
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

        <input
          value={responsavelChatId}
          placeholder="Responsável Chat ID"
          onChange={e => setResponsavelChatId(e.target.value)}
          disabled={!isAdmin}
        />

        {isAdmin && (
          <button onClick={() => savePerfil(perfil)}>Salvar ChatID</button>
        )}

        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <button onClick={handleSave}>Salvar Evento</button>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modal: React.CSSProperties = { background: '#fff', padding: 20, width: 360, borderRadius: 8 };