'use client';

import AgendaCalendar from './AgendaCalendar';
import { Perfil } from './types';

interface Props {
  userPerfil: Perfil;
  onPerfilChange: (p: Perfil) => void;
  userName: string;
}

export default function AgendaLayout({
  userPerfil,
  onPerfilChange,
  userName,
}: Props) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 220, padding: 16, borderRight: '1px solid #ddd' }}>
        <h3>{userName}</h3>

        <select
          value={userPerfil}
          onChange={e => onPerfilChange(e.target.value as Perfil)}
          style={{ width: '100%', marginTop: 12 }}
        >
          <option>Confi</option>
          <option>Cecília</option>
          <option>Luiza</option>
          <option>Júlio</option>
        </select>
      </aside>

      <main style={{ flex: 1, padding: 16 }}>
        <AgendaCalendar userPerfil={userPerfil} />
      </main>
    </div>
  );
}