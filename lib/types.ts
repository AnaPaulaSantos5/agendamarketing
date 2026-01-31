export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type Tarefa = {
  titulo: string;
  responsavel: Perfil;
  responsavelChatId?: string; // ✅ NOVO
  data: string; // ISO string
  status: 'Pendente' | 'Concluída';
  linkDrive?: string;
  notificar?: 'Sim' | 'Não';
};

export type AgendaEvent = {
  id: string;
  start: string; // ISO
  end: string;   // ISO
  allDay?: boolean;

  tipoEvento?: 'Interno' | 'Perfil';
  tipo?: string;

  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil?: Perfil;

  tarefa?: Tarefa | null;
};

export type ChecklistItem = {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
};