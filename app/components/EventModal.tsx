import { useState } from 'react';
import { AgendaEvent } from '../types';

export default function EventModal({ event, onClose }: { event: AgendaEvent; onClose: () => void }) {
  const [title, setTitle] = useState(event.conteudoPrincipal || '');
  const [secondary, setSecondary] = useState(event.conteudoSecundario || '');
  const [perfil, setPerfil] = useState(event.perfil || '');
  const [tarefaTitle, setTarefaTitle] = useState(event.tarefa?.titulo || '');
  const [linkDrive, setLinkDrive] = useState(event.tarefa?.linkDrive || '');
  const [status, setStatus] = useState(event.tarefa?.status || 'Pendente');

  const handleSave = async () => {
    const payload = {
      id: event.id,
      conteudoPrincipal: title,
      conteudoSecundario: secondary,
      perfil,
      tarefa: {
        titulo: tarefaTitle,
        status,
        linkDrive
      }
    };
    try {
      await fetch('/api/updateEvent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 50, left: 50, background: '#fff', padding: 20, zIndex: 10 }}>
      <h2>Editar Evento</h2>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Conteúdo Principal" />
      <input value={secondary} onChange={e => setSecondary(e.target.value)} placeholder="Conteúdo Secundário" />
      <input value={perfil} onChange={e => setPerfil(e.target.value)} placeholder="Perfil" />
      <input value={tarefaTitle} onChange={e => setTarefaTitle(e.target.value)} placeholder="Título da Tarefa" />
      <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)} placeholder="Link do Drive" />
      <select value={status} onChange={e => setStatus(e.target.value)}>
        <option value="Pendente">Pendente</option>
        <option value="Concluído">Concluído</option>
      </select>
      <div style={{ marginTop: 10 }}>
        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>Cancelar</button>
      </div>
    </div>
  );
}