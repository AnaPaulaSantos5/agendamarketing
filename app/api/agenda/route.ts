import { NextResponse } from 'next/server'
import { AgendaEvent, ChecklistItem } from '@/lib/types'

export async function GET() {
  const agenda: AgendaEvent[] = [
    {
      date: '2026-01-26',
      time: '09:00',
      title: 'Story bom dia motivacional',
      client: 'Confi'
    },
    {
      date: '2026-01-26',
      time: '18:00',
      title: 'Reel consórcio',
      client: 'Confi'
    }
  ]

  const checklist: ChecklistItem[] = [
    { id: '1', text: 'Publicar story', done: false, time: '09:00' },
    { id: '2', text: 'Publicar reel', done: false, time: '18:00' },
    { id: '3', text: 'Responder directs', done: false }
  ]

  return NextResponse.json({ agenda, checklist })
}
