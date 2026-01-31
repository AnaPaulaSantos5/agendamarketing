import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = 'admin'; // por enquanto você é admin
        token.perfil = 'Confi';
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.perfil = token.perfil as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };