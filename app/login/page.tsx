'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <button onClick={() => signIn('google')}>
        Entrar com Google
      </button>
    </div>
  );
}