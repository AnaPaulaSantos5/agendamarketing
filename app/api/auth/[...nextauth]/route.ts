import NextAuth, { JWT } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// LISTA DE E-MAILS PERMITIDOS
const EMAILS_PERMITIDOS = [
  "ana.paulinhacarneirosantos@gmail.com",
  // Adicione os outros e-mails da equipe aqui
];

interface CustomToken extends JWT {
  perfil?: string;
  responsavelChatId?: string;
  role?: string;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // TRAVA DE SEGURANÇA: Só deixa logar se estiver na lista
    async signIn({ user }) {
      if (user.email && EMAILS_PERMITIDOS.includes(user.email.toLowerCase())) {
        return true;
      }
      return "/login?error=AcessoNegado";
    },

    async jwt({ token, profile }) {
      const customToken = token as CustomToken;
      if (profile?.email) {
        const email = profile.email.toLowerCase();
        // Exemplo de atribuição de Role
        customToken.role = email === "ana.paulinhacarneirosantos@gmail.com" ? "admin" : "user";
      }
      return customToken;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as CustomToken).role;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

// ESTAS EXPORTAÇÕES SÃO OBRIGATÓRIAS PARA O APP ROUTER
export { handler as GET, handler as POST };
