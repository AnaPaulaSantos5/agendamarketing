import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      perfil: string;
      responsavelChatId: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface JWT {
    perfil?: string;
    responsavelChatId?: string;
    role?: string;
  }
}
