// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string;
      email?: string;
      image?: string;
      perfil: "Confi" | "Cecília" | "Luiza" | "Júlio";
      responsavelChatId: string;
    };
  }

  interface JWT {
    perfil?: "Confi" | "Cecília" | "Luiza" | "Júlio";
    responsavelChatId?: string;
  }
}