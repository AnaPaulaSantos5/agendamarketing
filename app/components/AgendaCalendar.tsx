'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type AgendaEvent = {
  id: string;
  title: string;
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
  tarefa?: {
    blocoId?: string;
    titulo?: string;
    responsavel?: string;
    data?: string;
    status?: string;
    linkDrive?: string;
    notificar?: string;
  };
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

// Função para formatar data para planilha (YYYY-MM-DD)
const formatDateForSheet = (dateStr: string) => {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<AgendaEvent>>({});

  // Carrega eventos da planilha
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data || []);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchAgenda();
  }, []);

  // Filtra eventos por perfil
  const filteredEvents = events.filter(e => e.perfil === filterProfile);

  // Ao clicar no calendário abre formulário
  const handleDateClick = (info: any) => {
    setFormVisible(true);
    setFormData({
      start: info.dateStr,
      end: info.dateStr,
      perfil: filterProfile,
    });
  };

  // Atualiza formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Salvar evento
  const handleSave = async () => {
    // Validação
    if (
      !formData.start ||
      !formData.end ||
      !formData.tipoEvento ||
      !formData.tipo ||
      !formData.conteudoPrincipal ||
      !formData.perfil
    ) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const newEvent: AgendaEvent = {
      id: String(Date.now()),
      start: formatDateForSheet(formData.start),
      end: formatDateForSheet(formData.end),
      tipoEvento: formData.tipoEvento,
      tipo: formData.tipo,
      conteudoPrincipal: formData.conteudoPrincipal,
      conteudoSecundario: formData.conteudoSecundario,
      cta: formData.cta,
      statusPostagem: formData.statusPostagem,
      perfil: formData.perfil as Perfil,
      linkDrive: formData.linkDrive,
      tarefa: formData.tarefa ? {
        blocoId: formData.tarefa.blocoId,
        titulo: formData.tarefa.titulo,
        responsavel: formData.tarefa.responsavel,
        data: formData.tarefa.data ? formatDateForSheet(formData.tarefa.data) : formatDateForSheet(formData.start),
        status: formData.tarefa.status,
        linkDrive: formData.tarefa.linkDrive,
        notificar: formData.tarefa.notificar,
      } : undefined,
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
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: '1rem' }}>
          Filtrar por perfil:
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
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={filteredEvents.map(ev => ({
            id: ev.id,
            title: ev.title,
            start: ev.start,
            end: ev.end,
          }))}
          dateClick={handleDateClick}
        />
      </div>

      {formVisible && (
        <div style={{ width: 300, padding: 10, border: '1px solid #ccc', borderRadius: 8 }}>
          <h3>Novo Evento</h3>

          <label>Data Início:</label>
          <input type="date" name="start" value={formData.start?.split('T')[0] || ''} onChange={handleChange} />

          <label>Data Fim:</label>
          <input type="date" name="end" value={formData.end?.split('T')[0] || ''} onChange={handleChange} />

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

          <label>Link Drive (opcional):</label>
          <input type="text" name="linkDrive" value={formData.linkDrive || ''} onChange={handleChange} />

          <button onClick={handleSave} style={{ marginTop: 10 }}>Salvar</button>
          <button onClick={() => { setFormVisible(false); setFormData({}); }} style={{ marginTop: 5 }}>Cancelar</button>
        </div>
      )}
    </div>
  );
}
