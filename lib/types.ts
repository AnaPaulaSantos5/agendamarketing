export type Profile = 'Confi' | 'Cecília' | 'Luiza' | 'Júlio';

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type AgendaItem = {
  id: string;
  title: string;
  profile: Profile;
  type: 'Perfil' | 'Interno';
  start: string; // ISO
  end: string;   // ISO
  checklist: ChecklistItem[];
};