'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type Tarefa = {
  blocoId?: string;
  titulo?: string;
  responsavel?: string;
  data?: string;
  status?: string;
  linkDrive?: string;
  notificar?: string;
};

type AgendaEvent = {
  id: string;
  start: string; // ISO string
  end: string;   // ISO string
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  linkDrive?: string;
  tarefa?: Tarefa;
  title?: string;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Carrega eventos da API
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        if (data.error) {
          console.error('Erro da API:', data.error);
          return;
        }

        // Mapear os eventos garantindo title
        const mappedEvents: AgendaEvent[] = (data || []).map((ev: any) => ({
          id: String(ev.id),
          start: ev.start,
          end: ev.end,
          tipoEvento: ev.tipoEvento,
          tipo: ev.tipo,
          conteudoPrincipal: ev.conteudoPrincipal,
          conteudoSecundario: ev.conteudoSecundario,
          cta: ev.cta,
          statusPostagem: ev.statusPostagem,
          perfil: ev.perfil,
          tarefa: ev.tarefa || {},
          linkDrive: ev.linkDrive,
          title: ev.tipo && ev.conteudoPrincipal
            ? `${ev.tipo}: ${ev.conteudoPrincipal}`
            : ev.conteudoPrincipal || ev.tipo || 'Evento',
        }));

        setEvents(mappedEvents);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchAgenda();
  }, []);

  // Filtra eventos por perfil
  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  // Abrir formulário ao clicar no calendário
  const handleDateClick = (info: any) => {
    setFormVisible(true);
    setFormData({
      start: info.dateStr,
      end: info.dateStr,
    });
  };

  // Atualiza formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Salvar evento
  const handleSave = async () => {
    if (!formData.start || !formData.end || !formData.tipoEvento || !formData.tipo || !formData.conteudoPrincipal || !formData.perfil) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const newEvent: AgendaEvent = {
      id: String(events.length + 1),
      start: formData.start,
      end: formData.end,
      tipoEvento: formData.tipoEvento,
      tipo: formData.tipo,
      conteudoPrincipal: formData.conteudoPrincipal,
      conteudoSecundario: formData.conteudoSecundario,
      cta: formData.cta,
      statusPostagem: formData.statusPostagem,
      perfil: formData.perfil as Perfil,
      tarefa: formData.tarefa,
      linkDrive: formData.linkDrive,
      title: `${formData.tipo}: ${formData.conteudoPrincipal}`,
    };

    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });

      if (!res.ok) throw new Error('Erro ao salvar');

      setEvents(prev => [...prev, newEvent]);
      setFormVisible(false);
      setFormData({});
    } catch (err) {
      console.error('Erro ao salvar evento', err);
      alert('Erro ao salvar evento');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ flex: 1 }}>
        {/* Filtro de perfil */}
        <div style={{ marginBottom: 10 }}>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Calendário */}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.title,
            start: ev.start,
            end: ev.end,
            extendedProps: {
              tipoEvento: ev.tipoEvento,
              tipo: ev.tipo,
              conteudoPrincipal: ev.conteudoPrincipal,
              conteudoSecundario: ev.conteudoSecundario,
              cta: ev.cta,
              statusPostagem: ev.statusPostagem,
              perfil: ev.perfil,
              tarefa: ev.tarefa || {},
              linkDrive: ev.linkDrive,
            },
          }))}
          dateClick={handleDateClick}
        />
      </div>

      {/* Formulário lateral */}
      {formVisible && (
        <div style={{ width: 300, border: '1px solid #ccc', padding: 10 }}>
          <h3>Novo Evento</h3>

          <label>Data Início:</label>
          <input type="datetime-local" name="start" value={formData.start || ''} onChange={handleChange} />

          <label>Data Fim:</label>
          <input type="datetime-local" name="end" value={formData.end || ''} onChange={handleChange} />

          <label>Tipo Evento:</label>
          <input type="text" name="tipoEvento" value={formData.tipoEvento || ''} onChange={handleChange} />

          <label>Tipo:</label>
          <input type="text" name="tipo" value={formData.tipo || ''} onChange={handleChange} />

          <label>Conteúdo Principal:</label>
          <input type="text" name="conteudoPrincipal" value={formData.conteudoPrincipal || ''} onChange={handleChange} />

          <label>Conteúdo Secundário:</label>
          <input type="text" name="conteudoSecundario" value={formData.conteudoSecundario || ''} onChange={handleChange} />

          <label>CTA:</label>
          <input type="text" name="cta" value={formData.cta || ''} onChange={handleChange} />

          <label>Status Postagem:</label>
          <input type="text" name="statusPostagem" value={formData.statusPostagem || ''} onChange={handleChange} />

          <label>Perfil:</label>
          <select name="perfil" value={formData.perfil || ''} onChange={handleChange}>
            <option value="">Selecione</option>
            {profiles.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <button onClick={handleSave} style={{ marginTop: 10 }}>Salvar</button>
          <button onClick={() => { setFormVisible(false); setFormData({}); }} style={{ marginTop: 5 }}>Cancelar</button>
        </div>
      )}
    </div>
  );
}
