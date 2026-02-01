// app/agenda/page.tsx
'use client';

import AgendaCalendar from '../components/AgendaCalendar';
import ProtectedRoute from '../components/ProtectedRoute';
import Header from '../components/Header';

export default function AgendaPage() {
  return (
    <ProtectedRoute>
      <Header />
      <AgendaCalendar />
    </ProtectedRoute>
  );
}