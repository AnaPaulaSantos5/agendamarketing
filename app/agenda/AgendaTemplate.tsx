'use client';
import React, { useState } from 'react';
import './AgendaTemplate.css';

const profiles = [
  { name: 'Confi', photo: '/profiles/confi.png', phone: '12345' },
  { name: 'Luiza', photo: '/profiles/luiza.png', phone: '23456' },
  { name: 'Júlio', photo: '/profiles/julio.png', phone: '34567' },
  { name: 'Cecília', photo: '/profiles/cecilia.png', phone: '45678' },
];

const mockEvents = [
  { title: 'Reunião X', color: '#ffce0a', time: '10:00-11:00' },
  { title: 'Revisar Documento', color: '#f0f0f0', time: '14:00-15:00' },
];

export default function AgendaTemplate() {
  const [selectedProfile, setSelectedProfile] = useState(profiles[0]);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="agenda-container">
      {/* Topo: perfis */}
      <div className="agenda-top-profiles">
        {profiles.map((p) => (
          <img
            key={p.name}
            src={p.photo}
            alt={p.name}
            className={`profile-avatar ${selectedProfile.name === p.name ? 'selected' : ''}`}
            onClick={() => setSelectedProfile(p)}
          />
        ))}
      </div>

      <div className="agenda-main">
        {/* Lateral esquerda: cliente */}
        <div className="agenda-left">
          <div className="client-card">
            <img src="/profiles/google-placeholder.png" alt="Cliente" className="client-photo" />
            <h3>{selectedProfile.name} Cliente</h3>
            <p>Email: cliente@email.com</p>
            <p>Telefone: {selectedProfile.phone}</p>

            <div className="checklist">
              <h4>Checklist</h4>
              <ul>
                <li>Revisar documento</li>
                <li>Confirmar reunião</li>
              </ul>
            </div>

            <button onClick={() => setModalOpen(true)}>+ Adicionar Evento</button>
          </div>
        </div>

        {/* Calendário central */}
        <div className="agenda-center">
          <div className="calendar-grid">
            {mockEvents.map((e, i) => (
              <div key={i} className="calendar-block" style={{ backgroundColor: e.color }}>
                <strong>{e.title}</strong>
                <span>{e.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lateral direita */}
        <div className="agenda-right">
          <div className="spotify-widget">
            <h4>Playlist Pública</h4>
            <div className="spotify-placeholder">🎵 Spotify Widget</div>
          </div>

          <div className="whatsapp-notifications">
            <div className="notification received">Mensagem recebida</div>
            <div className="notification sent">Mensagem enviada</div>
          </div>
        </div>
      </div>

      {/* Modal de evento */}
      {modalOpen && (
        <div className="event-modal">
          <div className="modal-content">
            <h3>Adicionar Evento</h3>
            <label>
              Título:
              <input type="text" placeholder="Conteúdo principal" />
            </label>
            <label>
              Conteúdo Secundário:
              <textarea placeholder="Detalhes"></textarea>
            </label>
            <label>
              Link Drive:
              <input type="text" placeholder="Link" />
            </label>
            <label>
              Selecionar Perfil:
              <select>
                {profiles.map((p) => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </label>
            <label>
              Data e Hora:
              <input type="datetime-local" />
            </label>
            <label>
              Cor do Evento:
              <div className="color-picker">
                <span style={{ backgroundColor: '#ffce0a' }}></span>
                <span style={{ backgroundColor: '#f0f0f0' }}></span>
                <span style={{ backgroundColor: '#1260c7' }}></span>
              </div>
            </label>

            <button onClick={() => setModalOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}