export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type AgendaEvent = {
  id: string;
  start: string; // ISO string com hora
  end: string;   // ISO string com hora
  tipoEvento?: string;
  tipo?: string;
  conteudoPrincipal?: string;
  perfil?: Perfil;
  tarefa?: TarefaItem;
};

export type TarefaItem = {
  titulo: string;
  responsavel: Perfil;
  data: string;        // ISO string
  status: 'Pendente' | 'Concluída';
  linkDrive?: string;
  notificar?: 'Sim' | 'Não';
};