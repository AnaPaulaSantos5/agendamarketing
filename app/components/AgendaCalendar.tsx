'use client';
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from './EventModal';

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    data: string;
    status: string;
    linkDrive?: string;
    notificar?: string;
  } | null;
  allDay?: boolean;
};

export type ChecklistItem = {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const today = new Date().toISOString().slice(0, 10);

  // Dados de teste para checklist
  useEffect(() => {
    const testData: ChecklistItem[] = [
      { id: '1', date: '26/01/26', client: 'Confi Seguros', task: 'Criar Story motivacional', done: false },
      { id: '2', date: '26/01/26', client: 'Confi Seguros', task: 'Criar enquete de abertura de semana', done: false },
      { id: '3', date: '27/01/26', client: 'Confi Finanças', task: 'Criar Reel educativo consórcio', done: false },
      { id: '4', date: '28/01/26', client: 'Confi Seguros', task: 'Criar Post seguro automóvel', done: false },
      { id: '5', date: '29/01/26', client: 'Confi Seguros', task: 'Criar Story quiz', done: false },
      { id: '6', date: '30/01/26', client: 'Confi Benefícios', task: 'Criar Reel storytelling cliente', done: false },
      { id: '7', date: '31/01/26', client: 'Confi Benefícios', task: 'Criar Story motivacional de lifestyle', done: false },
    ];
    setChecklist(testData);
  }, []);

  // Salvar ou editar evento
  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    if (isEdit) {
      setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
    } else {
      setEvents(prev => [...prev, ev]);
    }
    setModalOpen(false);
  };

  // Excluir evento
  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setModalOpen(false);
  };

  // Marcar item do checklist como concluído
  const toggleChecklistItem = (item: ChecklistItem) => {
    const updated = { ...item, done: !item.done };
    setChecklist(prev => prev.map(c => (c.id === item.id ? updated : c)));
  };

  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  // Filtrar checklist para hoje
  const todayChecklist = checklist.filter(item => {
    const [day, month, year] = item.date.split('/');
    const itemDate = new Date(`20${year}-${month}-${day}`);
    const todayDate = new Date();
    return (
      itemDate.getDate() === todayDate.getDate() &&
      itemDate.getMonth() === todayDate.getMonth() &&
      itemDate.getFullYear() === todayDate.getFullYear()
    );
  });

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 1 }}>
        {/* Filtro de perfil */}
        <div style={{ marginBottom: 10 }}>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Calendário */}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          selectable={true}
          editable={true}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.conteudoPrincipal,
            start: ev.start,
            end: ev.end,
          }))}
          select={info => {
            setSelectedEvent(null);
            setSelectedDate({ start: info.startStr, end: info.endStr });
            setModalOpen(true);
          }}
          eventClick={info => {
            const ev = events.find(e => e.id === info.event.id);
            if (ev) {
              setSelectedEvent(ev);
              setSelectedDate({ start: ev.start, end: ev.end });
              setModalOpen(true);
            }
          }}
        />
      </div>

      {/* Checklist lateral */}
      <div style={{ width: 300 }}>
        <h3>Checklist Hoje</h3>
        {todayChecklist.length === 0 && <p>Nenhum item para hoje</p>}
        {todayChecklist.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 6, marginBottom: 6, border: '1px solid #ccc', borderRadius: 4 }}>
            <div>
              <strong>{item.task}</strong> ({item.client}) - {item.done ? 'Concluído' : 'Pendente'}
            </div>
            <button onClick={() => toggleChecklistItem(item)} style={{ marginLeft: 8, cursor: 'pointer' }}>✅</button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={selectedDate.start}
          end={selectedDate.end}
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={deleteEvent}
        />
      )}
    </div>
  );
}
