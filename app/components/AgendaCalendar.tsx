'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar, { EventInput } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

type EventoForm = {
  Data_Inicio: string;
  Data_Fim: string;
  Tipo_Evento: string;
  Tipo: string;
  Conteudo_Principal: string;
  Conteudo_Secundario: string;
  CTA: string;
  Perfil: Perfil;
  LinkDrive?: string;
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [form, setForm] = useState<EventoForm>({
    Data_Inicio: '',
    Data_Fim: '',
    Tipo_Evento: '',
    Tipo: '',
    Conteudo_Principal: '',
    Conteudo_Secundario: '',
    CTA: '',
    Perfil: 'Confi',
    LinkDrive: '',
  });
  const [loading, setLoading] = useState(false);

  // Carregar eventos da planilha
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        if (data?.Agenda) {
          const transformed: EventInput[] = data.Agenda.map((item: any, index: number) => ({
            id: index.toString(),
            title: `${item.Tipo}: ${item.Conteudo_Principal}`,
            start: item.Data_Inicio,
            end: item.Data_Fim,
            extendedProps: {
              Tipo_Evento: item.Tipo_Evento,
              Conteudo_Principal: item.Conteudo_Principal,
              Conteudo_Secundario: item.Conteudo_Secundario,
              CTA: item.CTA,
              Perfil: item.Perfil,
              LinkDrive: item.LinkDrive || '',
              Status: item.Status_Postagem,
            },
          }));
          setEvents(transformed);
        }
      } catch (err) {
        console.error('Erro ao carregar agenda:', err);
      }
    }
    fetchAgenda();
  }, []);

  // Filtrar eventos por perfil
  const filteredEvents = events.filter(e => e.extendedProps?.Perfil === filterProfile);

  // Atualizar campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Enviar evento para API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Checar campos obrigatórios
    const requiredFields = ['Data_Inicio', 'Data_Fim', 'Tipo_Evento', 'Tipo', 'Conteudo_Principal', 'Perfil'];
    for (const field of requiredFields) {
      if (!form[field as keyof EventoForm]) {
        alert(`Preencha o campo ${field}`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erro ao salvar evento');

      // Atualizar calendário sem recarregar
      setEvents(prev => [
        ...prev,
        {
          id: (prev.length + 1).toString(),
          title: `${form.Tipo}: ${form.Conteudo_Principal}`,
          start: form.Data_Inicio,
          end: form.Data_Fim,
          extendedProps: { ...form, Status: 'Pendente' },
        },
      ]);

      // Resetar formulário
      setForm({
        Data_Inicio: '',
        Data_Fim: '',
        Tipo_Evento: '',
        Tipo: '',
        Conteudo_Principal: '',
        Conteudo_Secundario: '',
        CTA: '',
        Perfil: 'Confi',
        LinkDrive: '',
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar evento');
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Filtro de perfil */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Filtrar por perfil: </label>
        <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
          {profiles.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Formulário de evento */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h3>Adicionar Evento</h3>
        <input type="date" name="Data_Inicio" value={form.Data_Inicio} onChange={handleChange} required />
        <input type="date" name="Data_Fim" value={form.Data_Fim} onChange={handleChange} required />
        <input type="text" name="Tipo_Evento" placeholder="Tipo do Evento" value={form.Tipo_Evento} onChange={handleChange} required />
        <input type="text" name="Tipo" placeholder="Tipo" value={form.Tipo} onChange={handleChange} required />
        <input type="text" name="Conteudo_Principal" placeholder="Conteúdo Principal" value={form.Conteudo_Principal} onChange={handleChange} required />
        <input type="text" name="Conteudo_Secundario" placeholder="Conteúdo Secundário" value={form.Conteudo_Secundario} onChange={handleChange} />
        <input type="text" name="CTA" placeholder="CTA" value={form.CTA} onChange={handleChange} />
        <input type="text" name="LinkDrive" placeholder="Link Drive" value={form.LinkDrive} onChange={handleChange} />
        <select name="Perfil" value={form.Perfil} onChange={handleChange} required>
          {profiles.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Adicionar Evento'}</button>
      </form>

      {/* Calendário */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={filteredEvents}
        editable={true}
        selectable={true}
        eventClick={(info) => {
          alert(
            `Evento: ${info.event.title}\n` +
            `Tipo do Evento: ${info.event.extendedProps.Tipo_Evento}\n` +
            `Conteúdo Principal: ${info.event.extendedProps.Conteudo_Principal}\n` +
            `Link do roteiro: ${info.event.extendedProps.LinkDrive || 'N/A'}`
          );
        }}
      />
    </div>
  );
}
