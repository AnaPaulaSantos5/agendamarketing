export type Perfil =
  | 'Confi'
  | 'Cecília'
  | 'Luiza'
  | 'Júlio'
  | 'Confi Finanças'
  | 'Confi Benefícios'
  | 'Confi Seguros';

export type AgendaEvent = {
  id: string;
  start: string;
  end: string;
  tipoEvento: string;
  tipo: string;
  conteudoPrincipal: string;
  conteudoSecundario?: string;
  cta?: string;
  statusPostagem?: string;
  perfil: Perfil;
  tarefa?: {
    titulo: string;
    responsavel: Perfil;
    data: string;
    status: string;
    linkDrive?: string;
    notificar?: string;
  };
};