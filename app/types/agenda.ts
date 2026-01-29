export type Perfil = 'Confi' | 'Luiza' | 'Cecília' | 'Júlio'

export type AgendaItem = {
  id: string

  title: string
  description?: string

  start: string
  end?: string
  allDay?: boolean

  category: 'evento' | 'tarefa'
  visibility: 'interno' | 'perfil'

  perfil?: Perfil

  conteudoPrincipal?: string
  conteudoSecundario?: string
  linkDrive?: string

  status: 'pendente' | 'concluida'
}