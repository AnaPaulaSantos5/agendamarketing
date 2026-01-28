'use client';
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';
type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;
  linkDrive?: string;
  tarefa?: {
    blocoId: string;
    titulo: string;
    responsavel: string;
    data: string;
    status: string;
    linkDrive: string;
    notificar: string;
  };
};

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaCalendar() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [filterProfile, setFilterProfile] = useState<Perfil>('Confi');
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<any>({
    start: '',
    end: '',
    tipoEvento: '',
    tipo: '',
    conteudoPrincipal: '',
    conteudoSecundario: '',
    cta: '',
    statusPostagem: '',
    perfil: 'Confi',
    blocoId: '',
    tituloTarefa: '',
    responsavel: '',
    dataTarefa: '',
    statusTarefa: '',
    linkDrive: '',
    notificar: '',
  });

  // Carrega eventos da planilha
  useEffect(() => {
    async function fetchAgenda() {
      try {
        const res = await fetch('/api/agenda');
        const data = await res.json();
        if (data.error) {
          console.error('Erro da API:', data.error);
          return;
        }
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
    setFormData((prev: any) => ({
      ...prev,
      start: info.dateStr,
      end: info.dateStr,
      dataTarefa: info.dateStr,
    }));
  };

  // Atualiza formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Salvar evento e tarefa
  const handleSave = async () => {
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
      id: String(events.length + 1),
      start: formData.start,
      end: formData.end,
      tipoEvento: formData.tipoEvento,
      tipo: formData.tipo,
      conteudoPrincipal: formData.conteudoPrincipal,
      conteudoSecundario: formData.conteudoSecundario,
      cta: formData.cta,
      statusPostagem: formData.statusPostagem,
      perfil: formData.perfil,
      title: `${formData.tipo}: ${formData.conteudoPrincipal}`,
      tarefa: {
        blocoId: formData.blocoId || '',
        titulo: formData.tituloTarefa || '',
        responsavel: formData.responsavel || '',
        data: formData.dataTarefa || formData.start,
        status: formData.statusTarefa || '',
        linkDrive: formData.linkDrive || '',
        notificar: formData.notificar || '',
      },
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
      setFormData({
        start: '',
        end: '',
        tipoEvento: '',
        tipo: '',
        conteudoPrincipal: '',
        conteudoSecundario: '',
        cta: '',
        statusPostagem: '',
        perfil: 'Confi',
        blocoId: '',
        tituloTarefa: '',
        responsavel: '',
        dataTarefa: '',
        statusTarefa: '',
        linkDrive: '',
        notificar: '',
      });
    } catch (err) {
      console.error('Erro ao salvar evento', err);
      alert('Erro ao salvar evento');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {/* Calendário */}
      <div style={{ flex: 3 }}>
        <div>
          Filtrar por perfil:{' '}
          <select value={filterProfile} onChange={e => setFilterProfile(e.target.value as Perfil)}>
            {profiles.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
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

      {/* Formulário lateral */}
      {formVisible && (
        <div style={{ flex: 1, border: '1px solid #ccc', padding: 10, borderRadius: 6 }}>
          <h3>Novo Evento</h3>

          <label>Data Início:</label>
          <input type="date" name="start" value={formData.start} onChange={handleChange} />

          <label>Data Fim:</label>
          <input type="date" name="end" value={formData.end} onChange={handleChange} />

          <label>Tipo Evento:</label>
          <input name="tipoEvento" value={formData.tipoEvento} onChange={handleChange} />

          <label>Tipo:</label>
          <input name="tipo" value={formData.tipo} onChange={handleChange} />

          <label>Conteúdo Principal:</label>
          <input name="conteudoPrincipal" value={formData.conteudoPrincipal} onChange={handleChange} />

          <label>Conteúdo Secundário:</label>
          <input name="conteudoSecundario" value={formData.conteudoSecundario} onChange={handleChange} />

          <label>CTA:</label>
          <input name="cta" value={formData.cta} onChange={handleChange} />

          <label>Status Postagem:</label>
          <input name="statusPostagem" value={formData.statusPostagem} onChange={handleChange} />

          <label>Perfil:</label>
          <select name="perfil" value={formData.perfil} onChange={handleChange}>
            {profiles.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <hr />

          <h4>Dados da Tarefa</h4>

          <label>Bloco ID:</label>
          <input name="blocoId" value={formData.blocoId} onChange={handleChange} />

          <label>Título da Tarefa:</label>
          <input name="tituloTarefa" value={formData.tituloTarefa} onChange={handleChange} />

          <label>Responsável:</label>
          <input name="responsavel" value={formData.responsavel} onChange={handleChange} />

          <label>Data da Tarefa:</label>
          <input type="date" name="dataTarefa" value={formData.dataTarefa} onChange={handleChange} />

          <label>Status da Tarefa:</label>
          <input name="statusTarefa" value={formData.statusTarefa} onChange={handleChange} />

          <label>Link do Drive:</label>
          <input name="linkDrive" value={formData.linkDrive} onChange={handleChange} />

          <label>Notificar:</label>
          <input name="notificar" value={formData.notificar} onChange={handleChange} />

          <div style={{ marginTop: 10 }}>
            <button onClick={handleSave} style={{ marginRight: 5 }}>
              Salvar
            </button>
            <button onClick={() => setFormVisible(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}
