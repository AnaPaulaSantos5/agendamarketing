'use client';

import AgendaCalendar from '../components/AgendaCalendar';
import { useSession, signIn } from 'next-auth/react';

export default function AgendaPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Carregando...</p>;

  // se não estiver logado, exibe botão de login
  if (!session) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <button onClick={() => signIn("google")}>
          Entrar com Google
        </button>
      </div>
    );
  }

  return <AgendaCalendar />;
}