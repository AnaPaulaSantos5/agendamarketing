'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar, { EventApi } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type Evento = {
  id?: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  tipo_evento: string;
  tipo: string;
  conteudo_principal: string;
  conteudo_secundario?: string;
  cta?: string;
  status_postagem?: string;
  profile: Perfil;
  linkDrive?: string;
};

const perfis: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<Evento[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Evento>({
    start: '',
    end: '',
    tipo_evento: '',
    tipo: '',
    conteudo_principal: '',
    conteudo_secundario: '',
    cta: '',
    status_postagem: 'Pendente',
    profile: 'Confi',
    linkDrive: '',
  });

  // Carregar eventos da API
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        setEvents(data.Agenda);
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchAgenda();
  }, []);

  const filteredEvents = events.filter(e => e.profile === filterProfile);

  const handleEventClick = (event: EventApi) => {
    alert(`Evento: ${event.title}\nLink do roteiro: ${event.extendedProps.linkDrive || 'N/A'}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validação básica
    if (!formData.start || !formData.end || !formData.tipo_evento || !formData.tipo || !formData.conteudo_principal) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        setEvents(prev => [...prev, data]);
        setShowModal(false);
        // resetar formulário
        setFormData({
          start: '',
          end: '',
          tipo_evento: '',
          tipo: '',
          conteudo_principal: '',
          conteudo_secundario: '',
          cta: '',
          status_postagem: 'Pendente',
          profile: 'Confi',
          linkDrive: '',
        });
      } else {
        alert('Erro ao salvar evento: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
          {perfis.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button style={{ marginLeft: '1rem' }} onClick={() => setShowModal(true)}>Adicionar Evento</button>
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
          title: `${e.tipo}: ${e.conteudo_principal}`,
          start: e.start,
          end: e.end,
          extendedProps: { ...e },
        }))}
        editable={true}
        selectable={true}
        eventClick={info => handleEventClick(info.event)}
      />

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
            <h3>Adicionar Evento</h3>
            <label>Data Início*:</label>
            <input type="date" name="start" value={formData.start} onChange={handleInputChange} required />

            <label>Data Fim*:</label>
            <input type="date" name="end" value={formData.end} onChange={handleInputChange} required />

            <label>Tipo Evento*:</label>
            <input type="text" name="tipo_evento" value={formData.tipo_evento} onChange={handleInputChange} required />

            <label>Tipo*:</label>
            <input type="text" name="tipo" value={formData.tipo} onChange={handleInputChange} required />

            <label>Conteúdo Principal*:</label>
            <input type="text" name="conteudo_principal" value={formData.conteudo_principal} onChange={handleInputChange} required />

            <label>Conteúdo Secundário:</label>
            <input type="text" name="conteudo_secundario" value={formData.conteudo_secundario} onChange={handleInputChange} />

            <label>CTA:</label>
            <input type="text" name="cta" value={formData.cta} onChange={handleInputChange} />

            <label>Perfil*:</label>
            <select name="profile" value={formData.profile} onChange={handleInputChange} required>
              {perfis.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <label>Link Drive:</label>
            <input type="text" name="linkDrive" value={formData.linkDrive} onChange={handleInputChange} />

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
              <button type="submit">Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}