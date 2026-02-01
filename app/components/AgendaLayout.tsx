'use client';
import React, { useState } from 'react';
import Header from './Header';
import ProfileSidebar from './ProfileSidebar';
import RightSidebar from './RightSidebar';
import AgendaCalendar from './AgendaCalendar';
import { Perfil, AgendaEvent, ChecklistItem } from './types';

interface AgendaLayoutProps {
  events: AgendaEvent[];
  checklist: ChecklistItem[];
  userPerfil: Perfil;
  userRole: 'admin' | 'user';
  onSaveEvent: (ev: AgendaEvent, isEdit?: boolean) => void;
  onDeleteEvent: (id: string) => void;
  onToggleChecklistItem: (item: ChecklistItem) => void;
}

export default function AgendaLayout({
  events,
  checklist,
  userPerfil,
  userRole,
  onSaveEvent,
  onDeleteEvent,
  onToggleChecklistItem,
}: AgendaLayoutProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="agenda-layout" style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar esquerda */}
      <ProfileSidebar
        isOpen={profileOpen}
        onToggle={() => setProfileOpen(!profileOpen)}
        userPerfil={userPerfil}
        checklist={checklist}
        onToggleChecklistItem={onToggleChecklistItem}
      />

      {/* Área central */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Header />
        <AgendaCalendar
          events={events}
          userPerfil={userPerfil}
          userRole={userRole}
          onSave={onSaveEvent}
          onDelete={onDeleteEvent}
        />
      </div>

      {/* Sidebar direita */}
      <RightSidebar />
    </div>
  );
}