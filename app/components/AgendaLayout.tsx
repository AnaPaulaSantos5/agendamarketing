'use client';

import React, { useState } from 'react';
import ProfileSidebar from './ProfileSidebar';
import RightSidebar from './RightSidebar';
import AgendaCalendar from './AgendaCalendar';
import { Perfil, AgendaEvent } from './types';

interface AgendaLayoutProps {
  events: AgendaEvent[];
  userName: string;
  userPerfil: Perfil;
  responsavelChatId: string;
}

const profiles: Perfil[] = ['Confi', 'Cecília', 'Luiza', 'Júlio'];

export default function AgendaLayout({
  events,
  userName,
  userPerfil,
  responsavelChatId,
}: AgendaLayoutProps) {
  const [selectedPerfil, setSelectedPerfil] = useState<Perfil>(userPerfil);
  const [showProfilePanel, setShowProfilePanel] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ProfileSidebar
        userName={userName}
        userPerfil={selectedPerfil}
        responsavelChatId={responsavelChatId}
        profiles={profiles}
        onProfileChange={setSelectedPerfil}
        onToggleProfilePanel={() => setShowProfilePanel(prev => !prev)}
      />

      <main style={{ flex: 1, padding: 16 }}>
        <AgendaCalendar events={events} userPerfil={selectedPerfil} />
      </main>

      <RightSidebar />
    </div>
  );
}