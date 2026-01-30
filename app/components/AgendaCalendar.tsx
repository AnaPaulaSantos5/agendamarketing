// app/components/AgendaCalendar.tsx
'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
interface Tarefa {
  titulo: string;
  responsavel: string;
  data: string;
  status: string;
  linkDrive?: string;
  notificar?: string;
  responsavelChatId?: string; // opcional, vindo da planilha Tarefas
}

export interface AgendaEvent {
  id: string;
  start: string;
  end: string;
  tipoEvento: string;
  tipo: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: string;
  tarefa?: Tarefa | null;
}

const AgendaCalendar = () => {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  // Buscar eventos da planilha
  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data: AgendaEvent[] = await res.json();
      setEvents(
        data.map(ev => ({
          ...ev,
          start: typeof ev.start === 'string' ? ev.start : new Date(ev.start).toISOString(),
          end: typeof ev.end === 'string' ? ev.end : new Date(ev.end).toISOString(),
        }))
      );
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Salvar evento (POST ou PATCH)
  const saveEvent = async (ev: AgendaEvent, isEdit = false) => {
    try {
      if (isEdit) {
        await fetch('/api/agenda', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ev),
        });
        setEvents(prev => prev.map(e => (e.id === ev.id ? ev : e)));
      } else {
        const res = await fetch('/api/agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ev),
        });
        if (!res.ok) throw new Error('Erro ao salvar evento');
        // Adicionar ID temporário (será substituído na próxima busca)
        setEvents(prev => [...prev, { ...ev, id: String(prev.length + 1) }]);
      }
      setModalOpen(false);
      fetchEvents(); // garante atualização da tela
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  // Abrir modal
  const handleEventClick = (info: any) => {
    const ev = events.find(e => e.id === info.event.id);
    if (ev) {
      setSelectedEvent(ev);
      setModalOpen(true);
    }
  };

  // Selecionar data no calendário
  const handleDateSelect = (selectInfo: any) => {
    const start = selectInfo.start.toISOString();
    const end = selectInfo.end.toISOString();
    setSelectedEvent({
      id: '',
      start,
      end,
      tipoEvento: '',
      tipo: '',
      conteudoPrincipal: '',
      conteudoSecundario: '',
      cta: '',
      statusPostagem: '',
      perfil: '',
      tarefa: null,
    });
    setModalOpen(true);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        events={events.map(ev => ({
          id: ev.id,
          title: ev.tipoEvento || ev.conteudoPrincipal,
          start: ev.start,
          end: ev.end,
        }))}
        eventClick={handleEventClick}
        select={handleDateSelect}
      />

      {modalOpen && selectedEvent && (
        <EventModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          start={
            selectedEvent.start instanceof Date
              ? selectedEvent.start.toISOString()
              : selectedEvent.start
          }
          end={
            selectedEvent.end instanceof Date
              ? selectedEvent.end.toISOString()
              : selectedEvent.end
          }
          event={selectedEvent}
          onSave={saveEvent}
          onDelete={async (id: string) => {
            await fetch('/api/agenda', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id }),
            });
            setEvents(prev => prev.filter(e => e.id !== id));
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default AgendaCalendar;
