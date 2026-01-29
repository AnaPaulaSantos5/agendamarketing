export type AgendaEvent = {
  id: string;
  title: string;
  start: string;
  end: string;

  tipoEvento: string;
  tipo: string;

  conteudoPrincipal: string;
  conteudoSecundario: string;
  cta: string;

  statusPostagem: string;
  perfil: string;

  checklist: string[];
};