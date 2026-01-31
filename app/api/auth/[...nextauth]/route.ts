// app/api/auth/[...nextauth]/route.ts
import NextAuth, { JWT } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// 🔹 Tipagem customizada
interface CustomToken extends JWT {
  perfil?: "Confi" | "Cecília" | "Luiza" | "Júlio";
  responsavelChatId?: string;
  role?: "admin" | "user";
}

// 🔹 Configuração do NextAuth
const handler = NextAuth({
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
    // 🔑 JWT callback
    async jwt({ token, profile }) {
      const customToken = token as CustomToken;

      if (profile?.email) {
        const email = profile.email.toLowerCase();
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

      // 🔹 Retorna sempre um JWT válido
      return { ...token, ...customToken };
    },

    // 🔑 Session callback
    async session({ session, token }) {
      session.user.perfil = (token as CustomToken).perfil || "Confi";
      session.user.responsavelChatId = (token as CustomToken).responsavelChatId || "";
      session.user.role = (token as CustomToken).role || "user";

      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

// 🔹 Export para App Router
export { handler as GET, handler as POST };