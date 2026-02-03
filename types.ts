export interface Profile {
  name: string;
  role: string;
  photoUrl: string;
}

export interface Task {
  id: string;
  title: string;
}

export interface Client {
  name: string;
  status: 'Ativo' | 'Pausado' | 'Finalizado';
  tasks: Task[];
}

