import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string;
      email?: string;
      image?: string;
      perfil: "Confi" | "Cecília" | "Luiza" | "Júlio";
      responsavelChatId: string;
      role?: "admin" | "user";
    };
  }

  interface JWT {
    perfil?: "Confi" | "Cecília" | "Luiza" | "Júlio";
    responsavelChatId?: string;
    role?: "admin" | "user";
  }
}