export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string; // ISO string com hora
  end: string;   // ISO string com hora
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  perfil?: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    data: string;
    status: string;
    linkDrive?: string;
    notificar?: string;
  };
};