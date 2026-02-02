"use client";
import React from "react";
import "./CalendarGrid.css";

const CalendarGrid: React.FC = () => {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];
  const hours = Array.from({ length: 9 }, (_, i) => 9 + i); // 9h às 17h

  return (
    <div className="calendar-grid">
      <div className="calendar-header">
        {days.map((d) => (
          <div key={d} className="calendar-day">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar-body">
        {hours.map((h) => (
          <div key={h} className="calendar-row">
            {days.map((d) => (
              <div key={d + h} className="calendar-cell">
                {/* Aqui ficaria o evento visual */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;