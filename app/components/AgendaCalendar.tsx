'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type AgendaEvent = {
  id: string;
  Data_Inicio: string;
  Data_Fim: string;
  Tipo_Evento: string;
  Tipo: string;
  Conteudo_Principal: string;
  Conteudo_Secundario?: string;
  CTA?: string;
  Status_Postagem: string;
  Perfil: Perfil;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<AgendaEvent>>({});

  // Carregar eventos da planilha
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data.Agenda || []);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchAgenda();
  }, []);

  // Filtrar por perfil
  const filteredEvents = events.filter(e => e.Perfil === filterProfile);

  // Abrir formulário ao clicar em um dia
  const handleDateClick = (info: any) => {
    setFormData({
      Data_Inicio: info.dateStr,
      Data_Fim: info.dateStr,
      Tipo_Evento: '',
      Tipo: '',
      Conteudo_Principal: '',
      Conteudo_Secundario: '',
      CTA: '',
      Status_Postagem: '',
      Perfil: filterProfile,
    });
    setFormVisible(true);
  };

  // Salvar evento
  const handleSaveEvent = async () => {
    const requiredFields = [
      'Data_Inicio',
      'Data_Fim',
      'Tipo_Evento',
      'Tipo',
      'Conteudo_Principal',
      'Status_Postagem',
      'Perfil',
    ] as const;

    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Preencha todos os campos obrigatórios! Campo faltando: ${field}`);
        return;
      }
    }

    try {
      // Salvar na planilha Agenda
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Erro ao salvar na Agenda');

      const savedEvent = await res.json();
      setEvents([...events, savedEvent]);
      setFormVisible(false);
      setFormData({});
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento!');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Filtrar por perfil: </label>
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={filteredEvents.map(e => ({
            id: e.id,
            title: `${e.Tipo}: ${e.Conteudo_Principal}`,
            start: e.Data_Inicio,
            end: e.Data_Fim,
          }))}
          selectable={true}
          dateClick={handleDateClick}
        />
      </div>

      {/* Formulário lateral */}
      {formVisible && (
        <div style={{ width: '350px', marginLeft: '1rem', border: '1px solid #ccc', padding: '1rem' }}>
          <h3>Novo Evento</h3>

          <label>Data Início *</label>
          <input
            type="date"
            value={formData.Data_Inicio || ''}
            onChange={e => setFormData({ ...formData, Data_Inicio: e.target.value })}
          />

          <label>Data Fim *</label>
          <input
            type="date"
            value={formData.Data_Fim || ''}
            onChange={e => setFormData({ ...formData, Data_Fim: e.target.value })}
          />

          <label>Tipo Evento *</label>
          <input
            type="text"
            value={formData.Tipo_Evento || ''}
            onChange={e => setFormData({ ...formData, Tipo_Evento: e.target.value })}
          />

          <label>Tipo *</label>
          <input
            type="text"
            value={formData.Tipo || ''}
            onChange={e => setFormData({ ...formData, Tipo: e.target.value })}
          />

          <label>Conteúdo Principal *</label>
          <input
            type="text"
            value={formData.Conteudo_Principal || ''}
            onChange={e => setFormData({ ...formData, Conteudo_Principal: e.target.value })}
          />

          <label>Conteúdo Secundário</label>
          <input
            type="text"
            value={formData.Conteudo_Secundario || ''}
            onChange={e => setFormData({ ...formData, Conteudo_Secundario: e.target.value })}
          />

          <label>CTA</label>
          <input
            type="text"
            value={formData.CTA || ''}
            onChange={e => setFormData({ ...formData, CTA: e.target.value })}
          />

          <label>Status Postagem *</label>
          <input
            type="text"
            value={formData.Status_Postagem || ''}
            onChange={e => setFormData({ ...formData, Status_Postagem: e.target.value })}
          />

          <label>Perfil *</label>
          <select
            value={formData.Perfil || ''}
            onChange={e => setFormData({ ...formData, Perfil: e.target.value as Perfil })}
          >
            {profiles.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button onClick={handleSaveEvent} style={{ marginTop: '1rem' }}>
            Salvar Evento
          </button>
          <button onClick={() => setFormVisible(false)} style={{ marginLeft: '0.5rem' }}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
