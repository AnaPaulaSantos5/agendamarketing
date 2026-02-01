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

  // ✨ Campos do evento
  const [title, setTitle] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('Confi');
  const [tipo, setTipo] = useState<'Interno' | 'Perfil'>('Perfil');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [cta, setCta] = useState('');
  const [statusPostagem, setStatusPostagem] = useState('');

  // ✨ Campos da tarefa
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [tarefaData, setTarefaData] = useState('');

  // ✨ Datas do evento
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  // 🔹 Normaliza datas para datetime-local
  function formatDateLocal(date?: string) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  }

  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setPerfil(event.perfil || 'Confi');
      setTipo(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setConteudoSecundario(event.conteudoSecundario || '');
      setCta(event.cta || '');
      setStatusPostagem(event.statusPostagem || '');
      setStartDate(formatDateLocal(event.start));
      setEndDate(formatDateLocal(event.end));

      // 🔹 Preenche tarefa se existir
      setTarefaTitle(event.tarefa?.titulo || '');
      setResponsavel(event.tarefa?.responsavel || '');
      setResponsavelChatId(event.tarefa?.responsavelChatId || '');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setTarefaData(formatDateLocal(event.tarefa?.data));

      setEditing(false);
    } else {
      setEditing(true);
      setStartDate(formatDateLocal(start));
      setEndDate(formatDateLocal(end));
      setTarefaTitle('');
      setResponsavel('');
      setResponsavelChatId('');
      setLinkDrive('');
      setTarefaData(formatDateLocal(start));
    }
  }, [event, start, end]);

  if (!isOpen) return null;

  // 🔹 Função salvar
  const handleSave = async () => {
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
            data: tarefaData || startDate,
            status: 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : null,
    };

    try {
      // 🔹 Envia para backend
      const method = editing ? 'POST' : 'PATCH';
      const res = await fetch('/api/agenda', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ev),
      });
      const json = await res.json();
      console.log('save response', json);

      onSave(ev, !editing);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
    }
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

        <h4>Tarefa</h4>
        <input value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} placeholder="Título da tarefa" />
        <input value={responsavel} onChange={e => setResponsavel(e.target.value)} placeholder="Responsável" />
        <input value={responsavelChatId} onChange={e => setResponsavelChatId(e.target.value)} placeholder="Responsável Chat ID" />
        <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)} placeholder="Link do Drive" />
        <input type="datetime-local" value={tarefaData} onChange={e => setTarefaData(e.target.value)} />

        <h4>Datas do Evento</h4>
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
  zIndex: 9999,
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 360,
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: 8,
};