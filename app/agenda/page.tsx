'use client';

import Header from '@/app/components/Header';
import AgendaCalendar from '@/app/components/AgendaCalendar';

export default function AgendaPage() {
  return (
    <>
      <Header />
      <h1>Agenda de Marketing</h1>
      <AgendaCalendar isAdmin={true} />
    </>
  );
}
