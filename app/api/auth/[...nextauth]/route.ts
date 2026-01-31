// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// 🔹 Tipagem do token e session customizados
interface CustomToken {
  perfil?: "Confi" | "Cecília" | "Luiza" | "Júlio";
  responsavelChatId?: string;
  role?: "admin" | "user";
  email?: string;
  name?: string;
  picture?: string;
}

interface CustomSession {
  user: {
    name?: string;
    email?: string;
    image?: string;
    perfil: "Confi" | "Cecília" | "Luiza" | "Júlio";
    responsavelChatId: string;
    role: "admin" | "user";
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, profile }) {
      const customToken = token as CustomToken;

      if (profile) {
        const email = profile.email?.toLowerCase();
        switch (email) {
          case "ana.paulinhacarneirosantos@gmail.com":
            customToken.perfil = "Confi";
            customToken.responsavelChatId = "55999999999";
            customToken.role = "admin";
            break;
          case "luiza@example.com":
            customToken.perfil = "Luiza";
            customToken.responsavelChatId = "55999999998";
            customToken.role = "user";
            break;
          case "cecilia@example.com":
            customToken.perfil = "Cecília";
            customToken.responsavelChatId = "55999999997";
            customToken.role = "user";
            break;
          case "julio@example.com":
            customToken.perfil = "Júlio";
            customToken.responsavelChatId = "55999999996";
            customToken.role = "user";
            break;
          default:
            customToken.perfil = "Confi";
            customToken.responsavelChatId = "";
            customToken.role = "user";
        }
      }

      return customToken;
    },

    async session({ session, token }) {
      const customToken = token as CustomToken;
      const s = session as unknown as CustomSession;

      s.user.perfil = customToken.perfil || "Confi";
      s.user.responsavelChatId = customToken.responsavelChatId || "";
      s.user.role = customToken.role || "user";

      return s as unknown as typeof session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

// 🔹 Export compatível com App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };