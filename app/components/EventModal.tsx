'use client';
import React, { useState } from 'react';

type Profile = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  start: string;
  end: string;
};

export default function EventModal({ isOpen, onClose, onSave, start, end }: Props) {
  const [tipo, setTipo] = useState<'Evento' | 'Tarefa'>('Evento');
  const [tipoEvento, setTipoEvento] = useState('');
  const [conteudoPrincipal, setConteudoPrincipal] = useState('');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [perfil, setPerfil] = useState<Profile>('Confi');
  const [cta, setCTA] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ start, end, tipo, tipoEvento, conteudoPrincipal, conteudoSecundario, perfil, cta });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 350 }}>
        <h3>Novo Evento/Tarefa</h3>
        <label>Tipo</label>
        <select value={tipo} onChange={e => setTipo(e.target.value as any)}>
          <option value="Evento">Evento</option>
          <option value="Tarefa">Tarefa</option>
        </select>

        <label>Evento</label>
        <input value={tipoEvento} onChange={e => setTipoEvento(e.target.value)} />

        <label>Conteúdo Principal</label>
        <input value={conteudoPrincipal} onChange={e => setConteudoPrincipal(e.target.value)} />

        <label>Conteúdo Secundário</label>
        <input value={conteudoSecundario} onChange={e => setConteudoSecundario(e.target.value)} />

        <label>Perfil</label>
        <select value={perfil} onChange={e => setPerfil(e.target.value as Profile)}>
          <option value="Confi">Confi</option>
          <option value="Cecília">Cecília</option>
          <option value="Luiza">Luiza</option>
          <option value="Júlio">Júlio</option>
        </select>

        <label>Link do Drive</label>
        <input value={cta} onChange={e => setCTA(e.target.value)} />

        <button onClick={handleSave}>Salvar</button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>Cancelar</button>
      </div>
    </div>
  );
}
