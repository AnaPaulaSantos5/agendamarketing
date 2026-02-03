// app/types.ts
export interface Profile {
  name: string;
  role: string;
  photoUrl: string; // obrigatório
}

export interface Client {
  name: string;
  status: string;
  tasks: string[];
}