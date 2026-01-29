export type Perfil = 'Confi' | 'Luiza' | 'Cecília' | 'Júlio'

export type AgendaEvent = {
  id: string
  title: string

  date: string
  start?: string
  end?: string
  allDay?: boolean

  tipo: 'evento' | 'tarefa'
  status: 'pendente' | 'concluida' | 'cancelada'

  perfil: Perfil
}