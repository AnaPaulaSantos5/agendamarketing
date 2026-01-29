export type AgendaItem = {
  id: string
  dataInicio: string
  dataFim: string
  tipoEvento: string
  tipo: string
  conteudoPrincipal: string
  conteudoSecundario: string
  cta: string
  statusPostagem: string
  perfil: string
  linkDrive: string
}

export type TarefaItem = {
  id: string
  blocoId: string
  titulo: string
  responsavel: string
  data: string
  status: string
  linkDrive: string
  notificar: boolean
}