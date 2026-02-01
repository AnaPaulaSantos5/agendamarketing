'use client';

import React, { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from './types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
  onDelete: (id: string) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
};

const perfis: Perfil[] = ['Confi', 'Cecília', 'Júlio', 'Luiza'];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  start,
  end,
  event,
}: Props) {
  const [editing, setEditing] = useState(!event);

  const [title, setTitle] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('Confi');
  const [tipo, setTipo] = useState<'Interno' | 'Perfil'>('Perfil');

  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [cta, setCta] = useState('');
  const [statusPostagem, setStatusPostagem] = useState('');

  const [tarefaTitle, setTarefaTitle] = useState('');
  const [responsavel, setResponsavel] = useState<Perfil>('Confi');
  const [linkDrive, setLinkDrive] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState('');

  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || 'Confi');
      setTipo(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setConteudoSecundario(event.conteudoSecundario || '');
      setCta(event.cta || '');
      setStatusPostagem(event.statusPostagem || '');
      setTarefaTitle(event.tarefa?.titulo || '');
      setResponsavel(event.tarefa?.responsavel || 'Confi');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setResponsavelChatId(event.tarefa?.responsavelChatId || '');
      setStartDate(event.start);
      setEndDate(event.end);
      setEditing(false);
    } else {
      setEditing(true);
      setStartDate(start);
      setEndDate(end);
    }
  }, [event, start, end]);

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
      tipoEvento: tipo,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel,
            responsavelChatId,
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
        <h3>{event ? 'Editar Evento' : 'Novo Evento'}</h3>

        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" />
        <textarea
          value={conteudoSecundario}
          onChange={e => setConteudoSecundario(e.target.value)}
          placeholder="Conteúdo secundário"
        />
        <input value={cta} onChange={e => setCta(e.target.value)} placeholder="CTA" />
        <input
          value={statusPostagem}
          onChange={e => setStatusPostagem(e.target.value)}
          placeholder="Status postagem"
        />
        <input value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} placeholder="Tarefa" />
        <select value={responsavel} onChange={e => setResponsavel(e.target.value as Perfil)}>
          {perfis.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <input
          value={responsavelChatId}
          onChange={e => setResponsavelChatId(e.target.value)}
          placeholder="Responsável Chat ID"
        />
        <input
          value={linkDrive}
          onChange={e => setLinkDrive(e.target.value)}
          placeholder="Link do Drive"
        />
        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose}>Fechar</button>
        {event && <button onClick={() => onDelete(event.id)}>Excluir</button>}
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
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 360,
};