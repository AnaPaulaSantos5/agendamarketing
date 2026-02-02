import Header from "@/app/components/Header";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import AgendaCalendar from "@/app/components/AgendaCalendar";

export default function AgendaPage() {
  return (
    <ProtectedRoute>
      <Header />
      <AgendaCalendar />
    </ProtectedRoute>
  );
}
