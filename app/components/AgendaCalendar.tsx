'use client';

import React, { useState } from 'react';
import './AgendaCalendar.css'; // CSS para estilizar o layout

// Tipagem para perfis
interface Profile {
  id: string;
  name: string;
  photoURL?: string;
  chatId?: string;
}

// Tipagem para evento
interface Event {
  id: string;
  title: string;
  subtitle?: string;
  profile: Profile;
  start: string;
  end?: string;
  color?: string;
  link?: string;
}

interface AgendaCalendarProps {
  profiles: Profile[];
}

const placeholderProfiles: Profile[] = [
  { id: '1', name: 'Confi', photoURL: '/avatars/confi.png', chatId: '123' },
  { id: '2', name: 'Luiza', photoURL: '/avatars/luiza.png', chatId: '456' },
  { id: '3', name: 'Júlio', photoURL: '/avatars/julio.png', chatId: '789' },
  { id: '4', name: 'Cecília', photoURL: '/avatars/cecilia.png', chatId: '101' },
];

const AgendaCalendar: React.FC<AgendaCalendarProps> = ({ profiles = placeholderProfiles }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  return (
    <div className="agenda-container">
      {/* Top Profiles */}
      <div className="agenda-top-profiles">
        {profiles.map((p) => (
          <img
            key={p.id}
            src={p.photoURL || '/avatars/default.png'}
            alt={p.name}
            className="profile-avatar"
          />
        ))}
      </div>

      <div className="agenda-main">
        {/* Left Client Info + Checklist */}
        <div className="agenda-left">
          <div className="client-card">
            <img src="/avatars/default-client.png" alt="Cliente" className="client-photo" />
            <div className="client-info">
              <h3>Nome Cliente</h3>
              <p>Email: cliente@email.com</p>
              <p>Telefone: 12345</p>
            </div>
          </div>

          <div className="checklist">
            <h4>Checklist</h4>
            <ul>
              <li>Revisar documento</li>
              <li>Confirmar reunião</li>
              <li>+ Adicionar item</li>
            </ul>
            <button onClick={handleAddEvent}>+ Adicionar Evento</button>
          </div>
        </div>

        {/* Center Calendar */}
        <div className="agenda-center">
          <div className="calendar-placeholder">
            {/* Aqui vai o calendário visual */}
            <p>Calendário estilo moderno (blocos por horário)</p>
          </div>
        </div>

        {/* Right Spotify + Notifications */}
        <div className="agenda-right">
          <div className="spotify-widget">
            <h4>Playlist Pública</h4>
            <div className="spotify-placeholder">Spotify Widget</div>
          </div>

          <div className="whatsapp-notifications">
            <h4>Notificações WhatsApp</h4>
            <div className="notification received">Mensagem recebida</div>
            <div className="notification sent">Mensagem enviada</div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {modalOpen && (
        <div className="event-modal">
          <div className="event-modal-content">
            <h3>{selectedEvent ? 'Editar Evento' : 'Novo Evento'}</h3>
            <input placeholder="Título (conteúdo principal)" />
            <input placeholder="Conteúdo secundário" />
            <input placeholder="Link do Drive" />
            <select>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.chatId})
                </option>
              ))}
            </select>
            <input type="datetime-local" />
            <input type="datetime-local" />
            <div className="color-picker">
              <span style={{ backgroundColor: '#ffce0a' }} />
              <span style={{ backgroundColor: '#1260c7' }} />
              <span style={{ backgroundColor: '#f5886c' }} />
            </div>
            <button onClick={() => setModalOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaCalendar;