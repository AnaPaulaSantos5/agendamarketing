import React from 'react';

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function CalendarGrid() {
  return (
    <div className="flex-1 p-4">
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {days.map((d) => (
          <div key={d} className="font-bold">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, idx) => (
          <div key={idx} className="h-24 border rounded p-1 relative bg-gray-50 hover:bg-gray-100 cursor-pointer">
            <span className="text-xs absolute top-1 right-1 text-gray-500">{idx + 1}</span>
            {/* Evento exemplo */}
            {idx % 5 === 0 && (
              <div className="mt-4 bg-yellow-500 text-white text-xs rounded p-1">Evento</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}