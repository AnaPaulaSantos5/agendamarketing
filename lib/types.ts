export interface Tarefa {
  titulo: string;
  responsavel: string;
  status: 'Pendente' | 'Concluído';
  linkDrive?: string;
  notificar?: string;
}

export interface AgendaEvent {
  id: string;
  dateStart: string;
  dateEnd?: string;
  tipoEvento: string;
  tarefa?: Tarefa;
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  perfil?: string;
}

export interface ChecklistItem {
  id: string;
  date: string;
  client: string;
  task: string;
  done: boolean;
}