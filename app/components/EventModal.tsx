'use client';

import { useState } from 'react';
import { AgendaEvent } from '../types';

interface EventModalProps {
  event: AgendaEvent;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const [title, setTitle] = useState(event.conteudoPrincipal || '');
  const [subTitle, setSubTitle] = useState(event.conteudoSecundario || '');
  const [perfil, setPerfil] = useState(event.perfil || '');
  const [tarefaTitle, setTarefaTitle] = useState(event.tarefa?.titulo || '');
  const [status, setStatus] = useState(event.tarefa?.status || 'Pendente');
  const [linkDrive, setLinkDrive] = useState(event.tarefa?.linkDrive || '');

  const salvarEvento = async () => {
    // Aqui você pode fazer PATCH/PUT na planilha
    try {
      await fetch('/api/event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: event.id,
          conteudoPrincipal: title,
          conteudoSecundario: subTitle,
          perfil,
          tarefa: {
            titulo: tarefaTitle,
            status,
            linkDrive
          }
        })
      });
      alert('Evento salvo com sucesso!');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#fff', padding: 20, minWidth: 400 }}>
        <h3>Editar Evento</h3>
        <label>Título / Conteúdo Principal</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} />
        <label>Conteúdo Secundário</label>
        <input value={subTitle} onChange={e => setSubTitle(e.target.value)} style={{ width: '100%' }} />
        <label>Perfil</label>
        <input value={perfil} onChange={e => setPerfil(e.target.value)} style={{ width: '100%' }} />
        <label>Tarefa</label>
        <input value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} style={{ width: '100%' }} />
        <label>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
          <option value="Pendente">Pendente</option>
          <option value="Concluído">Concluído</option>
        </select>
        <label>Link Drive</label>
        <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)} style={{ width: '100%' }} />
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={salvarEvento}>Salvar</button>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;