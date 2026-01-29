// Perfis disponíveis na agenda
export type Perfil = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

// Itens de checklist para cada evento
// app/types.ts
export type TarefaItem = {
  id: string;
  texto: string;
  status?: string;
  responsavel?: string;
  feito?: boolean; // <- adiciona aqui
};

// Evento da agenda
export type AgendaEvent = {
  id: string;
  title: string;           // Título do evento
  start: string;           // ISO string
  end: string;             // ISO string
  perfil: Perfil;
  checklist: TarefaItem[];
};