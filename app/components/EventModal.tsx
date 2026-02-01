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
  isAdmin: boolean;
  perfilMap: Record<Perfil, { chatId: string; image?: string }>;
};

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  start,
  end,
  event,
  isAdmin,
  perfilMap,
}: Props) {
  const [title, setTitle] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('Confi');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [cta, setCta] = useState('');
  const [statusPostagem, setStatusPostagem] = useState('');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);
  const [perfilImage, setPerfilImage] = useState<string>();

  // Inicializa campos se houver evento existente
  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || 'Confi');
      setConteudoSecundario(event.conteudoSecundario || '');
      setCta(event.cta || '');
      setStatusPostagem(event.statusPostagem || '');
      setTarefaTitle(event.tarefa?.titulo || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setStartDate(event.start);
      setEndDate(event.end);
      setPerfilImage(event.tarefa?.userImage || perfilMap[event.perfil || 'Confi'].image);
    } else {
      setTitle('');
      setPerfil('Confi');
      setConteudoSecundario('');
      setCta('');
      setStatusPostagem('');
      setTarefaTitle('');
      setLinkDrive('');
      setStartDate(start);
      setEndDate(end);
      setPerfilImage(perfilMap['Confi'].image);
    }
  }, [event, start, end, perfilMap]);

  // Atualiza a foto automaticamente quando muda o perfil
  useEffect(() => {
    setPerfilImage(perfilMap[perfil].image);
  }, [perfil, perfilMap]);

  if (!isOpen) return null;

  const handleSave = () => {
    const ev: AgendaEvent = {
      id: event?.id || String(Date.now()),
      start: startDate,
      end: endDate,
      conteudoPrincipal: title,
      conteudoSecundario,
      cta,
      statusPostagem,
      perfil,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: perfil,
            responsavelChatId: perfilMap[perfil].chatId,
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

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Foto do perfil */}
        {perfilImage && (
          <img
            src={perfilImage}
            alt={perfil}
            style={{ width: 50, height: 50, borderRadius: '50%', float: 'left', marginRight: 12 }}
          />
        )}

        <h3>{event ? 'Editar Evento' : 'Novo Evento'}</h3>

        {/* Select de perfil */}
        <label>Perfil responsável:</label>
        <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)} style={{ marginBottom: 8 }}>
          {Object.keys(perfilMap).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" />
        <textarea value={conteudoSecundario} onChange={e => setConteudoSecundario(e.target.value)} placeholder="Conteúdo secundário" />
        <input value={cta} onChange={e => setCta(e.target.value)} placeholder="CTA" />
        <input value={statusPostagem} onChange={e => setStatusPostagem(e.target.value)} placeholder="Status postagem" />
        <input value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} placeholder="Tarefa" />
        <input value={perfilMap[perfil].chatId} placeholder="Responsável Chat ID" disabled />
        <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)} placeholder="Link do Drive" />

        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <div style={{ marginTop: 12 }}>
          <button onClick={handleSave}>Salvar</button>
          <button onClick={onClose} style={{ marginLeft: 8 }}>Fechar</button>
          <button
            onClick={() => { if (event && confirm('Deseja realmente excluir este evento?')) onDelete(event.id); }}
            style={{ marginLeft: 8, backgroundColor: '#ff4d4f', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 4 }}
          >
            Excluir
          </button>
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
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 360,
  borderRadius: 8,
};