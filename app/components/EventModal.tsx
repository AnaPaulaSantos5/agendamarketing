// components/EventModal.tsx
import React from "react";
import { Event } from "../../types"; // ajuste para onde seu tipo Event está

interface EventModalProps {
  event: Event;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          minWidth: "300px",
        }}
      >
        <h2>{event.title}</h2>
        <p>{event.description}</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default EventModal;