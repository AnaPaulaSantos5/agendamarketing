// app/api/auth/[...nextauth]/route.ts

const EMAILS_PERMITIDOS = [
  "ana.paulinhacarneirosantos@gmail.com",
  "cecilia@seuemail.com",
  "luiza@seuemail.com",
  "julio@seuemail.com"
];

const handler = NextAuth({
  // ... providers (mantenha como está)
  callbacks: {
    async signIn({ user }) {
      if (user.email && EMAILS_PERMITIDOS.includes(user.email.toLowerCase())) {
        return true; // Acesso liberado
      }
      return "/login?error=AcessoNegado"; // Redireciona se não estiver na lista
    },
    
    async jwt({ token, profile }) {
      // ... sua lógica de JWT que já temos
      return token;
    },

    async session({ session, token }) {
      // ... sua lógica de sessão que já temos
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login', // Centraliza erros na sua página de login
  }
});
