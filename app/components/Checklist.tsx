'use client';
import React, { useState } from 'react';

export default function Checklist() {
  const [items, setItems] = useState(['Revisar documento', 'Confirmar reunião']);

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, flex: 1 }}>
      <h4>Checklist</h4>
      <ul>
        {items.map((item, idx) => <li key={idx}>{item}</li>)}
      </ul>
      <button onClick={() => setItems([...items, 'Novo item'])} style={{ marginTop: 8 }}>+ Adicionar Evento</button>
    </div>
  );
}