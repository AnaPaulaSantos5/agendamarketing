'use client';

import { useEffect, useState } from 'react';

// Tipos
interface Tarefa {
  titulo: string;
  responsavel?: string;
  status?: string;
  linkDrive?: string;
  notificar?: string;
}

export interface AgendaEvent {
  id: string;
  dateStart: string;
  dateEnd?: string;
  tipoEvento: string;
  tarefa?: Tarefa;
  conteudoPrincipal: string;
  conteudoSecundario: string;
  perfil: string;
}

export interface ChecklistItem {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
}

// Função para mapear planilha
export const mapPlanilhaParaEventos = (sheetData: any[]): AgendaEvent[] => {
  return sheetData.map(row => ({
    id: row.ID || row.Bloco_ID || String(Math.random()),
    dateStart: row.Data_Inicio || row.Data || '',
    dateEnd: row.Data_Fim || '',
    tipoEvento: row.Tipo_Evento || row.Tarefa || 'Evento',
    tarefa: row.Titulo
      ? {
          titulo: row.Titulo,
          responsavel: row.Responsavel || '',
          status: row.Status || 'Pendente',
          linkDrive: row.LinkDrive || '',
          notificar: row.Notificar || ''
        }
      : undefined,
    conteudoPrincipal: row.Conteudo_Principal || '',
    conteudoSecundario: row.Conteudo_Secundario || '',
    perfil: row.Perfil || row.Cliente || 'Pessoal'
  }));
};

// Modal de edição
interface EventModalProps {
  event: AgendaEvent | null;
  onClose: () => void;
  onSave: (updated: AgendaEvent) => void;
}

function EventModal({ event, onClose, onSave }: EventModalProps) {
  const [conteudoPrincipal, setConteudoPrincipal] = useState('');
  const [conteudoSecundario, setConteudoSecundario] = useState('');
  const [tarefaTitulo, setTarefaTitulo] = useState('');
  const [status, setStatus] = useState('Pendente');

  useEffect(() => {
    if (event) {
      setConteudoPrincipal(event.conteudoPrincipal);
      setConteudoSecundario(event.conteudoSecundario);
      setTarefaTitulo(event.tarefa?.titulo || '');
      setStatus(event.tarefa?.status || 'Pendente');
    }
  }, [event]);

  if (!event) return null;

  const handleSave = () => {
    const updated: AgendaEvent = {
      ...event,
      conteudoPrincipal,
      conteudoSecundario,
      tarefa: tarefaTitulo
        ? { ...event.tarefa, titulo: tarefaTitulo, status }
        : undefined
    };
    onSave(updated);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#fff', padding: 20, width: 400, borderRadius: 8 }}>
        <h3>Editar Evento</h3>
        <label>Conteúdo Principal</label>
        <input
          value={conteudoPrincipal}
          onChange={e => setConteudoPrincipal(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <label>Conteúdo Secundário</label>
        <input
          value={conteudoSecundario}
          onChange={e => setConteudoSecundario(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <label>Tarefa</label>
        <input
          value={tarefaTitulo}
          onChange={e => setTarefaTitulo(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <label>Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', marginBottom: 10 }}>
          <option>Pendente</option>
          <option>Concluído</option>
        </select>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSave}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// AgendaCalendar principal
interface AgendaCalendarProps {
  sheetData: any[];
}

export default function AgendaCalendar({ sheetData }: AgendaCalendarProps) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [modalEvent, setModalEvent] = useState<AgendaEvent | null>(null);

  useEffect(() => {
    const mapped = mapPlanilhaParaEventos(sheetData);
    setEvents(mapped);

    const today = new Date().toISOString().slice(0, 10);
    const todayChecklist: ChecklistItem[] = mapped
      .filter(e => e.tarefa && e.dateStart.slice(0, 10) === today && e.tarefa.status !== 'Concluído')
      .map(e => ({
        id: e.id,
        date: e.dateStart,
        client: e.perfil,
        task: e.tarefa!.titulo,
        done: false
      }));
    setChecklist(todayChecklist);
  }, [sheetData]);

  const concluirTarefa = async (id: string) => {
    setChecklist(prev => prev.filter(c => c.id !== id));
    try {
      await fetch('/api/checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao concluir tarefa');
    }
  };

  const handleSaveEvent = (updated: AgendaEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));

    // Atualiza checklist se necessário
    const today = new Date().toISOString().slice(0, 10);
    setChecklist(prev => {
      const withoutUpdated = prev.filter(c => c.id !== updated.id);
      if (updated.tarefa && updated.dateStart.slice(0, 10) === today && updated.tarefa.status !== 'Concluído') {
        return [...withoutUpdated, {
          id: updated.id,
          date: updated.dateStart,
          client: updated.perfil,
          task: updated.tarefa.titulo,
          done: false
        }];
      }
      return withoutUpdated;
    });
  };

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Agenda principal */}
      <div style={{ flex: 3 }}>
        <h2>Agenda</h2>
        {events.map(e => (
          <div key={e.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, cursor: 'pointer' }}
               onClick={() => setModalEvent(e)}>
            <strong>{e.tipoEvento}</strong> - {e.dateStart}
            {e.dateEnd && <> até {e.dateEnd}</>}
            <div>{e.conteudoPrincipal}</div>
            <div>{e.conteudoSecundario}</div>
            {e.tarefa && (
              <div>
                Tarefa: {e.tarefa.titulo} - Status: {e.tarefa.status} - Perfil: {e.perfil}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Checklist lateral */}
      <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: 10 }}>
        <h3>Checklist Hoje</h3>
        {checklist.length === 0 && <p>Sem tarefas para hoje ✅</p>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {checklist.map(item => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ flex: 1 }}>
                {item.task} ({item.client})
              </span>
              <button onClick={() => concluirTarefa(item.id)}>✅</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de evento */}
      {modalEvent && <EventModal event={modalEvent} onClose={() => setModalEvent(null)} onSave={handleSaveEvent} />}
    </div>
  );
}