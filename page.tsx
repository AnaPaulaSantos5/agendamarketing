"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
// ... outros imports

export default function MarketingAgenda() {
  const { data: session, status } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Se estiver carregando a sessão, mostramos um loading simples
  if (status === "loading") return <div className="h-screen flex items-center justify-center font-causten">Carregando Agenda...</div>;

  return (
    <div className="min-h-screen font-causten bg-[#F8FAFC]">
      {/* Sidebar com Foto do Usuário conforme solicitado */}
      <aside className="fixed left-0 h-full w-20 flex flex-col items-center py-6 bg-white border-r">
        <img 
          src={session?.user?.image || "https://ui-avatars.com/api/?name=User"} 
          className="w-12 h-12 rounded-full cursor-pointer hover:ring-4 ring-blue-100 transition-all"
          onClick={() => setIsProfileOpen(true)}
          alt="Perfil"
        />
        {/* Playlist Spotify aqui embaixo como você pediu */}
        <div className="mt-auto mb-4">
           {/* Widget Spotify */}
        </div>
      </aside>

      {/* Modal de Perfil com os dados do seu arquivo route.ts */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-slate-100">
            <div className="flex flex-col items-center mb-6">
              <img src={session?.user?.image || ""} className="w-20 h-20 rounded-full mb-3" />
              <h3 className="text-xl font-black">{session?.user?.name}</h3>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                {session?.user?.role} - {session?.user?.perfil}
              </span>
            </div>

            <div className="space-y-4 text-sm font-medium">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-xs">E-mail</p>
                <p>{session?.user?.email}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-slate-400 text-xs">Chat ID (WAHA)</p>
                <p className="font-mono text-blue-600">
                   {session?.user?.responsavelChatId || "Não vinculado"}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsProfileOpen(false)}
              className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Calendário Centralizado */}
      <main className="ml-20 p-8">
        {/* ... código do calendário ... */}
      </main>
    </div>
  );
}
