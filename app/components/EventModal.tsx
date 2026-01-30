'use client';
import React, { useState, useEffect } from 'react';
import { AgendaEvent, Perfil } from './AgendaCalendar';

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
  const [title, setTitle] = useState('');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('Confi');
  const [tipo, setTipo] = useState<'Interno' | 'Perfil'>('Perfil');
  const [tarefaTitle, setTarefaTitle] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState('');
  const [linkDrive, setLinkDrive] = useState('');
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  // Atualiza campos quando abre o modal
  useEffect(() => {
    if (event) {
      setTitle(event.conteudoPrincipal || '');
      setConteudoSecundario(event.conteudoSecundario || '');
      setPerfil(event.perfil || 'Confi');
      setTipo(event.tipoEvento === 'Interno' ? 'Interno' : 'Perfil');
      setTarefaTitle(event.tarefa?.titulo || '');
      setResponsavelChatId(event.tarefa?.responsavel || event.perfil || 'Confi');
      setLinkDrive(event.tarefa?.linkDrive || '');
      setStartDate(event.dateStart);
      setEndDate(event.dateEnd || event.dateStart);
      setEditing(false);
    } else {
      setTitle('');
      setConteudoSecundario('');
      setPerfil('Confi');
      setTipo('Perfil');
      setTarefaTitle('');
      setResponsavelChatId('');
      setLinkDrive('');
      setStartDate(start);
      setEndDate(end);
      setEditing(true);
    }
  }, [event, start, end]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title) return alert('Informe o título do evento');

    const ev: AgendaEvent = {
      id: event?.id || String(new Date().getTime()),
      dateStart: startDate,
      dateEnd: endDate,
      tipoEvento: tipo,
      conteudoPrincipal: title,
      conteudoSecundario,
      perfil,
      tarefa: tarefaTitle
        ? {
            titulo: tarefaTitle,
            responsavel: responsavelChatId || perfil,
            status: event?.tarefa?.status || 'Pendente',
            linkDrive,
            notificar: 'Sim',
          }
        : null,
    };

    onSave(ev, !!event);
    onClose();
  };

  const handleDelete = () => {
    if (!event) return;
    if (confirm('Deseja realmente excluir este evento?')) {
      onDelete(event.id);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>{event && !editing ? 'Detalhes do Evento' : 'Novo Evento/Tarefa'}</h3>

        {event && !editing && (
          <button onClick={() => setEditing(true)} style={{ marginBottom: 10 }}>
            ✏️ Editar
          </button>
        )}

        {/* Título */}
        <label>Título:</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={!editing}
          style={input}
        />

        {/* Conteúdo Secundário */}
        <label>Conteúdo Secundário:</label>
        <textarea
          value={conteudoSecundario}
          onChange={e => setConteudoSecundario(e.target.value)}
          disabled={!editing}
          style={input}
        />

        {/* Perfil */}
        <label>Perfil:</label>
        <select
          value={perfil}
          onChange={e => setPerfil(e.target.value as Perfil)}
          disabled={!editing}
          style={input}
        >
          <option value="Confi">Confi</option>
          <option value="Cecília">Cecília</option>
          <option value="Luiza">Luiza</option>
          <option value="Júlio">Júlio</option>
        </select>

        {/* Tipo */}
        <label>Tipo:</label>
        <select
          value={tipo}
          onChange={e => setTipo(e.target.value as any)}
          disabled={!editing}
          style={input}
        >
          <option value="Interno">Interno</option>
          <option value="Perfil">Perfil</option>
        </select>

        {/* Tarefa */}
        <label>Tarefa:</label>
        <input
          type="text"
          value={tarefaTitle}
          onChange={e => setTarefaTitle(e.target.value)}
          disabled={!editing}
          style={input}
        />

        {/* Responsável Chat */}
        <label>Responsável Chat:</label>
        <input
          type="text"
          value={responsavelChatId}
          onChange={e => setResponsavelChatId(e.target.value)}
          disabled={!editing}
          style={input}
        />

        {/* Link Drive */}
        <label>Link Drive:</label>
        <input
          type="text"
          value={linkDrive}
          onChange={e => setLinkDrive(e.target.value)}
          disabled={!editing}
          style={input}
        />

        {/* Datas */}
        <label>Início:</label>
        <input
          type="datetime-local"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          disabled={!editing}
          style={input}
        />

        <label>Fim:</label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          disabled={!editing}
          style={input}
        />

        {/* Botões */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <button onClick={handleSave}>Salvar</button>
          <button onClick={onClose}>Fechar</button>
          {event && <button onClick={handleDelete}>Excluir</button>}
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
  zIndex: 999,
};

const modal: React.CSSProperties = {
  background: '#fff',
  padding: 20,
  width: 400,
  borderRadius: 8,
};

const input: React.CSSProperties = {
  width: '100%',
  marginBottom: 10,
  padding: 8,
};
