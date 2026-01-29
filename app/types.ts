export type Perfil = 'Confi Finanças' | 'Confi Seguros' | 'Confi Benefícios';

export interface TarefaItem {
  id: string;
  texto: string;
  feito: boolean;
  status: 'Pendente' | 'Concluída';
  responsavel?: string;
}

export interface AgendaEvent {
  id: string;
  conteudoPrincipal: string;
  perfil: Perfil;
  checklist: TarefaItem[];
  start: string; // ISO string
  end: string;   // ISO string
}