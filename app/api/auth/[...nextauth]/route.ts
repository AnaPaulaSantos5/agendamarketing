import NextAuth, { JWT } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Defina o tipo exatamente como está no seu arquivo global de tipos
type PerfilNomes = "Confi" | "Cecília" | "Luiza" | "Júlio";

const EMAILS_PERMITIDOS = [
  "ana.paulinhacarneirosantos@gmail.com",
  // adicione os outros aqui
];

// Corrigindo a extensão da interface para bater com o global
interface CustomToken extends JWT {
  perfil?: PerfilNomes;
  responsavelChatId?: string;
  role?: "admin" | "user";
}

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
      const customToken = token as CustomToken;
      if (profile?.email) {
        const email = profile.email.toLowerCase();
        // Aqui garantimos que o valor atribuído seja um dos tipos aceitos
        customToken.perfil = "Confi"; 
        customToken.role = email === "ana.paulinhacarneirosantos@gmail.com" ? "admin" : "user";
      }
      return customToken;
    },
    async session({ session, token }) {
      const customToken = token as CustomToken;
      if (session.user) {
        session.user.perfil = customToken.perfil || "Confi";
        session.user.responsavelChatId = customToken.responsavelChatId || "";
        session.user.role = customToken.role || "user";
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
