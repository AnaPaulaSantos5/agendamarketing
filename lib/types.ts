export type AgendaEvent = {
  id: string;

  dateStart: string;   // ISO ou string da planilha
  dateEnd?: string;

  tipoEvento: 'Evento' | 'Tarefa';

  tarefa?: {
    titulo: string;
    responsavel?: string;
    responsavelChatId?: string;
    status?: 'Pendente' | 'Concluído';
    linkDrive?: string;
    notificar?: string;
    cta?: string;
  };

  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  perfil?: string;
};