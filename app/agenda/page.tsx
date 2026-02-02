import Header from "@/app/components/Header";
import AgendaCalendar from "@/app/components/AgendaCalendar";

export default function AgendaPage() {
  return (
    <>
      <Header />
      <main className="p-6">
        <AgendaCalendar />
      </main>
    </>
  );
}
