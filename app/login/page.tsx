'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation'; // Importe isso
import { motion } from 'framer-motion';

export default function LoginPage() {
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

        {/* MENSAGEM DE ERRO SE O E-MAIL NÃO ESTIVER NA LISTA */}
        {error === 'AcessoNegado' && (
          <div className="bg-red-50 border-2 border-red-500 text-red-600 p-4 rounded-2xl mb-6 font-bold text-sm uppercase">
            E-mail não autorizado para esta agenda.
          </div>
        )}

        <p className="text-sm font-bold opacity-30 uppercase tracking-widest mb-10">
          Acesso exclusivo para equipe autorizada
        </p>
        
        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full bg-black text-white py-5 rounded-[25px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-4 shadow-lg"
        >
          Entrar com Google
        </button>
      </motion.div>
    </div>
  );
}
