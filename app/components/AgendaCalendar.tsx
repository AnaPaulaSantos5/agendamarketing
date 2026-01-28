'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg } from '@fullcalendar/core';

type AgendaEvent = {
  id: string;
  Data_Inicio: string;
  Data_Fim: string;
  Tipo_Evento: string;
  Tipo: string;
  Conteudo_Principal: string;
  Conteudo_Secundario: string;
  CTA: string;
  Status_Postagem: string;
  Perfil: string;
};

const profiles = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<string>('Confi');
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<AgendaEvent>>({});

  // Carregar eventos da API
  const fetchAgenda = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      setEvents(data.Agenda);
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
    }
  };

  useEffect(() => {
    fetchAgenda();
  }, []);

  // Filtrar eventos por perfil
  const filteredEvents = events.filter(e => e.Perfil === filterProfile);

  // Função para abrir o formulário
  const openForm = (selected?: DateSelectArg) => {
    if (selected) {
      setFormData({
        Data_Inicio: selected.startStr,
        Data_Fim: selected.endStr,
        Status_Postagem: 'Pendente',
        Perfil: 'Confi',
      });
    } else {
      setFormData({});
    }
    setFormVisible(true);
  };

  // Função para salvar evento
  const saveEvent = async () => {
    // Checar campos obrigatórios
    if (!formData.Data_Inicio || !formData.Data_Fim || !formData.Tipo || !formData.Conteudo_Principal || !formData.Perfil) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormVisible(false);
        setFormData({});
        fetchAgenda(); // Recarregar agenda
      } else {
        alert('Erro ao salvar evento');
      }
    } catch (err) {
      console.error('Erro ao salvar evento:', err);
    }
  };

  return (
    <div>
      {/* Filtro de perfil */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value)}>
          {profiles.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={() => openForm()} style={{ marginLeft: '1rem' }}>Adicionar Evento</button>
      </div>

      {/* FullCalendar */}
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
          title: `${e.Tipo_Evento}: ${e.Conteudo_Principal}`,
          start: e.Data_Inicio,
          end: e.Data_Fim,
          extendedProps: {
            Tipo: e.Tipo,
            Conteudo_Secundario: e.Conteudo_Secundario,
            CTA: e.CTA,
            Status_Postagem: e.Status_Postagem,
            Perfil: e.Perfil
          }
        }))}
        editable={true}
        selectable={true}
        select={openForm}
        eventClick={(info: EventClickArg) => {
          const e = info.event.extendedProps;
          alert(
            `Tipo: ${e.Tipo}\nConteúdo Principal: ${info.event.title}\nConteúdo Secundário: ${e.Conteudo_Secundario}\nCTA: ${e.CTA}\nStatus: ${e.Status_Postagem}\nPerfil: ${e.Perfil}`
          );
        }}
      />

      {/* Modal/Formulário */}
      {formVisible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{ background: 'white', padding: '1rem', width: '400px', borderRadius: '8px' }}>
            <h3>Adicionar Evento</h3>
            <label>Data Início:</label>
            <input type="date" value={formData.Data_Inicio || ''} onChange={e => setFormData({ ...formData, Data_Inicio: e.target.value })} />
            <label>Data Fim:</label>
            <input type="date" value={formData.Data_Fim || ''} onChange={e => setFormData({ ...formData, Data_Fim: e.target.value })} />
            <label>Tipo Evento:</label>
            <input value={formData.Tipo_Evento || ''} onChange={e => setFormData({ ...formData, Tipo_Evento: e.target.value })} />
            <label>Tipo:</label>
            <input value={formData.Tipo || ''} onChange={e => setFormData({ ...formData, Tipo: e.target.value })} />
            <label>Conteúdo Principal:</label>
            <input value={formData.Conteudo_Principal || ''} onChange={e => setFormData({ ...formData, Conteudo_Principal: e.target.value })} />
            <label>Conteúdo Secundário:</label>
            <input value={formData.Conteudo_Secundario || ''} onChange={e => setFormData({ ...formData, Conteudo_Secundario: e.target.value })} />
            <label>CTA:</label>
            <input value={formData.CTA || ''} onChange={e => setFormData({ ...formData, CTA: e.target.value })} />
            <label>Status Postagem:</label>
            <input value={formData.Status_Postagem || ''} onChange={e => setFormData({ ...formData, Status_Postagem: e.target.value })} />
            <label>Perfil:</label>
            <select value={formData.Perfil || 'Confi'} onChange={e => setFormData({ ...formData, Perfil: e.target.value })}>
              {profiles.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={saveEvent}>Salvar</button>
              <button onClick={() => setFormVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
