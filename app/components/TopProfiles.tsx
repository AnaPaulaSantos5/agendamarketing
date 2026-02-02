'use client';
import React from 'react';

const profiles = ['Confi', 'Luiza', 'Júlio', 'Cecília'];

export default function TopProfiles() {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      {profiles.map(name => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: '#ccc',
            display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            {name[0]}
          </div>
          <span style={{ fontSize: 12 }}>{name}</span>
        </div>
      ))}
    </div>
  );
}