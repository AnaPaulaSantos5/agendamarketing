export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil: Perfil;
  tipoEvento?: 'Interno' | 'Perfil';
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    responsavelChatId?: string;
    data: string;
    status: string;
    linkDrive?: string;
    notificar?: 'Sim' | 'Não';
  } | null;
  allDay?: boolean;
};

export type ChecklistItem = {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
};