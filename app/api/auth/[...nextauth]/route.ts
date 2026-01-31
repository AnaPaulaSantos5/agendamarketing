// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const email = profile.email?.toLowerCase();
        if (email === "ana.paulinhacarneirosantos@gmail.com") {
          token.perfil = "Confi";
          token.responsavelChatId = "55999999999";
        } else if (email === "luiza@empresa.com") {
          token.perfil = "Luiza";
          token.responsavelChatId = "55999999998";
        } else if (email === "cecilia@empresa.com") {
          token.perfil = "Cecília";
          token.responsavelChatId = "55999999997";
        } else if (email === "julio@empresa.com") {
          token.perfil = "Júlio";
          token.responsavelChatId = "55999999996";
        } else {
          token.perfil = "Confi";
          token.responsavelChatId = "00000000000";
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.perfil = token.perfil as "Confi" | "Cecília" | "Luiza" | "Júlio";
      session.user.responsavelChatId = token.responsavelChatId as string;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// **No App Router precisamos exportar apenas GET e POST**
export { handler as GET, handler as POST };