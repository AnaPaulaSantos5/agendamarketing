"use client";
import React from "react";
import "./EventModal.css";

type EventModalProps = {
  open: boolean;
  onClose: () => void;
};

const EventModal: React.FC<EventModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Título do Evento</h2>
        <textarea placeholder="Conteúdo secundário..." />
        <input type="text" placeholder="Link do Drive" />
        <div className="profile-selection">
          <div className="profile-item">
            <img src="/profiles/confi.png" alt="Confi" />
            <span>Confi</span>
          </div>
          <div className="profile-item">
            <img src="/profiles/luiza.png" alt="Luiza" />
            <span>Luiza</span>
          </div>
        </div>
        <div className="date-time">
          <input type="date" />
          <input type="time" />
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Fechar</button>
          <button>Criar Evento</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;