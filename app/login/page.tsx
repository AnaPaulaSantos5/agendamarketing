"use client";
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// O Next.js exige Suspense ao usar useSearchParams em build de produção
function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="h-screen flex items-center justify-center bg-white font-sans">
      <div className="border-2 border-black p-12 rounded-[50px] text-center shadow-[15px_15px_0px_black] max-w-md w-full">
        <h1 className="text-4xl font-black uppercase mb-6">Agenda Marketing</h1>
        
        {error === 'AcessoNegado' && (
          <div className="bg-red-50 border-2 border-red-500 text-red-600 p-4 rounded-2xl mb-6 font-bold text-xs uppercase">
            E-mail não autorizado.
          </div>
        )}

        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest"
        >
          Entrar com Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
