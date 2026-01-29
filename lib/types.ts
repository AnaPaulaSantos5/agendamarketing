// Tipos globais usados em toda a aplicação

export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string; // ISO string completa: yyyy-mm-ddThh:mm
  end: string;   // ISO string completa: yyyy-mm-ddThh:mm
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  perfil?: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    data: string;
    status: 'Pendente' | 'Concluída';
    linkDrive?: string;
    notificar?: 'Sim' | 'Não';
  };
};