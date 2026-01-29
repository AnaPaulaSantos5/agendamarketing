export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio' | 'Confi Finanças' | 'Confi Benefícios';

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
  perfil: Perfil; // Agora todas as opções são aceitas
  checklist?: string[];
};