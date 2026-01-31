'use client';
import React, { useEffect, useState } from 'react';
import { AgendaEvent, Perfil } from '@/lib/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ev: AgendaEvent, isEdit?: boolean) => void;
  onDelete: (id: string) => void;
  start: string;
  end: string;
  event?: AgendaEvent | null;
};

const perfis: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function EventModal({
  isOpen, onClose, onSave, onDelete, start, end, event
}: Props) {

  const [titulo, setTitulo] = useState('');
  const [perfil, setPerfil] = useState<Perfil>('Confi');
  const [cta, setCta] = useState('');
  const [conteudoSec, setConteudoSec] = useState('');

  const [tarefaTitulo, setTarefaTitulo] = useState('');
  const [responsavelChatId, setResponsavelChatId] = useState('');
  const [linkDrive, setLinkDrive] = useState('');

  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(end);

  useEffect(() => {
    if (event) {
      setTitulo(event.conteudoPrincipal || '');
      setPerfil(event.perfil || 'Confi');
      setCta(event.cta || '');
      setConteudoSec(event.conteudoSecundario || '');

      setTarefaTitulo(event.tarefa?.titulo || '');
      setResponsavelChatId(event.tarefa?.responsavelChatId || '');
      setLinkDrive(event.tarefa?.linkDrive || '');

      setStartDate(event.start);
      setEndDate(event.end);
    }
  }, [event, start, end]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!titulo) return alert('Informe o título');

    const ev: AgendaEvent = {
      id: event?.id || String(Date.now()),
      start: startDate,
      end: endDate,
      conteudoPrincipal: titulo,
      conteudoSecundario: conteudoSec,
      cta,
      perfil,
      tarefa: tarefaTitulo
        ? {
            titulo: tarefaTitulo,
            responsavel: perfil,
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

        <input placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
        <input placeholder="Conteúdo secundário" value={conteudoSec} onChange={e => setConteudoSec(e.target.value)} />
        <input placeholder="CTA" value={cta} onChange={e => setCta(e.target.value)} />

        <select value={perfil} onChange={e => setPerfil(e.target.value as Perfil)}>
          {perfis.map(p => <option key={p}>{p}</option>)}
        </select>

        <hr />

        <input placeholder="Título da tarefa" value={tarefaTitulo} onChange={e => setTarefaTitulo(e.target.value)} />
        <input placeholder="ResponsávelChatId" value={responsavelChatId} onChange={e => setResponsavelChatId(e.target.value)} />
        <input placeholder="Link Drive" value={linkDrive} onChange={e => setLinkDrive(e.target.value)} />

        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <button onClick={handleSave}>Salvar</button>
        {event && <button onClick={() => onDelete(event.id)}>Excluir</button>}
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

const overlay = { position:'fixed', inset:0, background:'rgba(0,0,0,.4)', display:'flex', justifyContent:'center', alignItems:'center' };
const modal = { background:'#fff', padding:20, width:380, borderRadius:8 };