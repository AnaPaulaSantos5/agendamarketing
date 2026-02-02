'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') signIn('google');
  }, [status]);

  if (status === 'loading') return <p>Carregando...</p>;
  if (status === 'unauthenticated') return null;

  return <>{children}</>;
}