// app/components/EventModal.tsx
'use client';
import { useEffect, useState } from 'react';

interface EventModalProps {
  event: any;
  perfis: { nome: string; foto: string; chatId: string }[];
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function EventModal({ event, perfis, onSave, onDelete, onClose }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [descricao, setDescricao] = useState('');
  const [perfil, setPerfil] = useState(perfis[0]?.nome || '');
  const [dataHora, setDataHora] = useState(event.start || '');

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescricao(event.descricao || '');
      setPerfil(event.perfil || perfis[0]?.nome);
      setDataHora(event.start || '');
    }
  }, [event, perfis]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 400 }}>
        <h2>{event.id ? 'Editar Evento' : 'Novo Evento'}</h2>

        <div style={{ marginBottom: 10 }}>
          <label>Título</label>
          <input className="w-full border p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Descrição</label>
          <textarea className="w-full border p-2 rounded" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Perfil</label>
          <select className="w-full border p-2 rounded" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            {perfis.map(p => (
              <option key={p.nome} value={p.nome}>{p.nome} - {p.chatId}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Data e Hora</label>
          <input type="datetime-local" className="w-full border p-2 rounded" value={dataHora} onChange={(e) => setDataHora(e.target.value)} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          {event.id && <button style={{ color: 'red' }} onClick={() => onDelete(event.id)}>Excluir</button>}
          <div>
            <button style={{ marginRight: 8 }} onClick={onClose}>Cancelar</button>
            <button onClick={() => onSave({ ...event, title, descricao, perfil, start: dataHora })}>Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}