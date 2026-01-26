export type ChecklistItem = {
  id: string
  text: string
  done: boolean
  time?: string
}

export type AgendaEvent = {
  date: string
  title: string
  time: string
  client: string
}
