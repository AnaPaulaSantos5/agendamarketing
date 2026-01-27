'use client';

import { useEffect, useState } from 'react';

type AgendaEvent = {
  date: string;
  type: string;
  main: string;
  secondary: string;
  cta: string;
  status: string;
  profile: string;
};

type ChecklistItem = {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
};

type AgendaData = {
  agenda: AgendaEvent[];
  checklist: ChecklistItem[];
};

export default function AgendaPage() {
  const [data, setData] = useState<AgendaData | null>(null);
  const [selectedProfile, setSelectedProfile] = useState('Confi Seguros');

  useEffect(() => {
    fetch('/api/agenda')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Erro ao carregar agenda', err));
  }, []);

  if (!data) return <p>Carregando agenda...</p>;

  const filteredAgenda = data.agenda.filter(ev => ev.profile === selectedProfile);
  const filteredChecklist = data.checklist.filter(item =>
    filteredAgenda.some(ev => ev.date === item.date && ev.profile === item.client)
  );

  const toggleChecklist = (id: string) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        checklist: prev.checklist.map(item =>
          item.id === id ? { ...item, done: !item.done } : item
        ),
      };
    });
  };

  // Agrupar agenda por data para destacar blocos de campanha
  const agendaByDate: Record<string, AgendaEvent[]> = {};
  filteredAgenda.forEach(ev => {
    if (!agendaByDate[ev.date]) agendaByDate[ev.date] = [];
    agendaByDate[ev.date].push(ev);
  });

  return (
    <div style={{ padding: 24 }}>
      <h1>Agenda de Conteúdo</h1>

      <div style={{ marginBottom: 24 }}>
        <label>
          Filtro por Perfil:{' '}
          <select
            value={selectedProfile}
            onChange={e => setSelectedProfile(e.target.value)}
          >
            <option value="Confi Seguros">Confi Seguros</option>
            <option value="Confi Finanças">Confi Finanças</option>
            <option value="Confi Benefícios">Confi Benefícios</option>
            <option value="Confi Portáteis">Confi Portáteis</option>
          </select>
        </label>
      </div>

      {Object.entries(agendaByDate).map(([date, events]) => (
        <div
          key={date}
          style={{
            marginBottom: 20,
            padding: 12,
            border: '1px solid #ccc',
            borderRadius: 8,
            backgroundColor: '#f7f7f7',
          }}
        >
          <h3>{date}</h3>
          {events.map((ev, idx) => (
            <div key={idx} style={{ marginBottom: 6 }}>
              <strong>{ev.type}</strong>: {ev.main} — {ev.secondary}  
              <br />
              <em>{ev.cta}</em> — Status: {ev.status}
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <h4>Checklist</h4>
            {filteredChecklist
              .filter(item => item.date === date)
              .map(item => (
                <label key={item.id} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleChecklist(item.id)}
                  />{' '}
                  {item.task}
                </label>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
