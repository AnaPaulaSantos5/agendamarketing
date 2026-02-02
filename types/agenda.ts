export type AgendaEvent = {
  id?: string;

  title: string;
  start: string;
  end: string;

  perfil: string;
  tipoEvento?: string;

  conteudoPrincipal?: string;
  conteudoSecundario?: string;
  cta?: string;

  status?: string;
};
