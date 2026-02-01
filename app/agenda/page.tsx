'use client';

import { useState } from 'react';
import AgendaLayout from '../components/AgendaLayout';
import { Perfil } from '../components/types';

export default function AgendaPage() {
  const [perfil, setPerfil] = useState<Perfil>('Confi');

  return (
    <AgendaLayout
      userPerfil={perfil}
      onPerfilChange={setPerfil}
      userName="Agenda Marketing"
    />
  );
}