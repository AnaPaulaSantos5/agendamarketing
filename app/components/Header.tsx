// app/components/Header.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
      <div>
        {session?.user?.name ? `Olá, ${session.user.name} (${session.user.perfil})` : ''}
      </div>
      <button onClick={() => signOut()}>Sair</button>
    </div>
  );
}