'use client';

import AgendaCalendar from './AgendaCalendar';
import SidebarEsquerda from './SidebarEsquerda';
import RightSidebar from './RightSidebar';
import { AgendaEvent, ChecklistItem, Perfil } from './types';

type Props = {
  events: AgendaEvent[];
  checklist: ChecklistItem[];
  userPerfil: Perfil;
  onPerfilChange: (p: Perfil) => void;
  userName: string;
  responsavelChatId: string;
};

export default function AgendaLayout(props: Props) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <SidebarEsquerda
        checklist={props.checklist}
        filterProfile={props.userPerfil}
        setFilterProfile={props.onPerfilChange}
        profiles={['Confi','Cecília','Luiza','Júlio']}
      />

      <main style={{ flex: 1, padding: 16 }}>
        <AgendaCalendar
          events={props.events.filter(e => e.perfil === props.userPerfil)}
          userPerfil={props.userPerfil}
        />
      </main>

      <RightSidebar />
    </div>
  );
}