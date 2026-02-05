import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const EMAILS_PERMITIDOS = [
  "ana.paulinhacarneirosantos@gmail.com",
  // Adicione os outros aqui
];

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email && EMAILS_PERMITIDOS.includes(user.email.toLowerCase())) {
        return true;
      }
      return "/login?error=AcessoNegado";
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        const email = profile.email.toLowerCase();
        // Atribuição direta para evitar erro de interface incompatível
        token.perfil = "Confi"; 
        token.role = email === "ana.paulinhacarneirosantos@gmail.com" ? "admin" : "user";
        token.responsavelChatId = email === "ana.paulinhacarneirosantos@gmail.com" ? "55999999999" : "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Passando os dados do token para a sessão
        (session.user as any).perfil = token.perfil;
        (session.user as any).role = token.role;
        (session.user as any).responsavelChatId = token.responsavelChatId;
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

export { handler as GET, handler as POST };
