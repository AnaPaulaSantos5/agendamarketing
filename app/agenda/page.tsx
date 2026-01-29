import AgendaCalendar from '@/app/components/AgendaCalendar'
import ChecklistLateral from '@/app/components/ChecklistLateral'

export default function AgendaPage() {
  return (
    <div className="flex h-screen">
      <div className="flex-1">
        <AgendaCalendar />
      </div>

      <ChecklistLateral />
    </div>
  )
}