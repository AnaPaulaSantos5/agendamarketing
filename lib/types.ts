type AgendaEvent = {
  id: string;
  dateStart: string;
  dateEnd?: string;
  tipoEvento: string; // Ex: 'Evento', 'Tarefa'
  tarefa?: {
    titulo: string;
    responsavel?: string;
    status?: 'Pendente' | 'Concluído';
    linkDrive?: string;
    notificar?: string;
  };
  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  perfil?: string;
};