import { AgendaEvent, ChecklistItem } from '@/lib/types'

async function getAgenda() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agenda`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Falha ao carregar agenda')
  return res.json()
}

export default async function AgendaPage() {
  const data: { agenda: AgendaEvent[]; checklist: ChecklistItem[] } = await getAgenda()

  return (
    <div style={{ padding: 24 }}>
      <h1>Agenda</h1>

      <h2>Agenda do Dia</h2>
      {data.agenda.map((item) => (
        <p key={item.time}>
          {item.time} — {item.title}
        </p>
      ))}

      <h2>Checklist</h2>
      {data.checklist.map((item) => (
        <label key={item.id} style={{ display: 'block' }}>
          <input type="checkbox" /> {item.text}
        </label>
      ))}
    </div>
  )
}
