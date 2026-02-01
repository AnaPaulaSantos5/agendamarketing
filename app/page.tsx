'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/agenda'); // redireciona direto pra agenda se já estiver logado
    }
  }, [status]);

  if (status === 'loading') return <p>Carregando...</p>;

  return (
    <main style={{ padding: 32 }}>
      <h1>Agenda de Marketing</h1>
      <p>Sistema interno de organização de conteúdos, gravações e publicações.</p>
      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => signIn("google")}
          style={{ padding: '12px 20px', fontSize: 16, cursor: 'pointer' }}
        >
          Entrar com Google
        </button>
      </div>
    </main>
  );
}