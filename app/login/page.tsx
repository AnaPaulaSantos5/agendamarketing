"use client";
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="h-screen w-full bg-white flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="border-2 border-black p-12 rounded-[50px] text-center shadow-[15px_15px_0px_black] max-w-md w-full"
      >
        <h1 className="text-5xl font-black uppercase tracking-tighter mb-8 leading-none">
          Agenda<br/>Marketing
        </h1>

        {error === 'AcessoNegado' && (
          <div className="bg-red-50 border-2 border-red-500 text-red-600 p-4 rounded-2xl mb-6 font-bold text-xs uppercase">
            E-mail não autorizado para esta agenda.
          </div>
        )}

        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full bg-black text-white py-5 rounded-[25px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-4"
        >
          Entrar com Google
        </button>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen grid place-items-center font-black">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  );
}
