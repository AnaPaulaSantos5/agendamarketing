import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      perfil: "Luiza" | "Cecília" | "Júlio" | "Confi";
      responsavelChatId: string;
    };
  }
}