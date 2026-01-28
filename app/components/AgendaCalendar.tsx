'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar, { EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateSelectArg } from '@fullcalendar/interaction';
import Modal from 'react-modal';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  tipo_evento: string;
  tipo: string;
  conteudo_principal: string;
  conteudo_secundario: string;
  cta: string;
  status_postagem: string;
  profile: Perfil;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

Modal.setAppElement('#__next');

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');

  // Modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [form, setForm] = useState({
    tipo_evento: '',
    tipo: '',
    conteudo_principal: '',
    conteudo_secundario: '',
    cta: '',
    status_postagem: '',
    profile: 'Confi' as Perfil,
  });

  // Buscar eventos da Agenda
  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(data.Agenda || []);
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
    }
  }

  // Quando seleciona datas no calendário
  const handleSelect = (selectInfo: DateSelectArg) => {
    setSelectedDates({ start: selectInfo.startStr, end: selectInfo.endStr });
    setForm({
      tipo_evento: '',
      tipo: '',
      conteudo_principal: '',
      conteudo_secundario: '',
      cta: '',
      status_postagem: '',
      profile: 'Confi',
    });
    setModalIsOpen(true);
  };

  // Atualizar formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Salvar evento
  const handleSave = async () => {
    // Validação simples
    const requiredFields = ['tipo_evento', 'tipo', 'conteudo_principal', 'status_postagem', 'profile'];
    for (const field of requiredFields) {
      if (!form[field as keyof typeof form]) {
        alert(`Preencha o campo ${field}`);
        return;
      }
    }

    const newEvent: AgendaEvent = {
      id: String(events.length),
      title: `${form.tipo_evento}: ${form.conteudo_principal}`,
      start: selectedDates.start,
      end: selectedDates.end,
      ...form,
    };

    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      if (!res.ok) throw new Error('Erro ao salvar');

      setEvents(prev => [...prev, newEvent]);
      setModalIsOpen(false);
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      alert('Erro ao salvar evento');
    }
  };

  const filteredEvents = events.filter(e => e.profile === filterProfile);

  return (
    <div>
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
        selectable={true}
        select={handleSelect}
        events={filteredEvents.map(e => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
        }))}
        editable={true}
      />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Adicionar Evento"
        style={{
          content: { top: '20%', left: '20%', right: '20%', bottom: 'auto' }
        }}
      >
        <h2>Adicionar Evento</h2>
        <div>
          <label>Data Início:</label>
          <input type="date" value={selectedDates.start} readOnly />
        </div>
        <div>
          <label>Data Fim:</label>
          <input type="date" value={selectedDates.end} readOnly />
        </div>
        <div>
          <label>Tipo Evento:</label>
          <input name="tipo_evento" value={form.tipo_evento} onChange={handleChange} />
        </div>
        <div>
          <label>Tipo:</label>
          <input name="tipo" value={form.tipo} onChange={handleChange} />
        </div>
        <div>
          <label>Conteúdo Principal:</label>
          <input name="conteudo_principal" value={form.conteudo_principal} onChange={handleChange} />
        </div>
        <div>
          <label>Conteúdo Secundário:</label>
          <input name="conteudo_secundario" value={form.conteudo_secundario} onChange={handleChange} />
        </div>
        <div>
          <label>CTA:</label>
          <input name="cta" value={form.cta} onChange={handleChange} />
        </div>
        <div>
          <label>Status Postagem:</label>
          <input name="status_postagem" value={form.status_postagem} onChange={handleChange} />
        </div>
        <div>
          <label>Perfil:</label>
          <select name="profile" value={form.profile} onChange={handleChange}>
            {profiles.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <button onClick={handleSave}>Salvar</button>
        <button onClick={() => setModalIsOpen(false)}>Cancelar</button>
      </Modal>
    </div>
  );
}
