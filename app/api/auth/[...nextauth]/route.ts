// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
    async jwt({ token, profile }) {
      if (profile) {
        const email = profile.email?.toLowerCase();

        if (email === "ana.paulinhacarneirosantos@gmail.com") {
          token.perfil = "Confi";
          token.responsavelChatId = "55999999999";
          token.role = "admin";
        } else if (email === "luiza@example.com") {
          token.perfil = "Luiza";
          token.responsavelChatId = "55999999998";
          token.role = "user";
        } else if (email === "cecilia@example.com") {
          token.perfil = "Cecília";
          token.responsavelChatId = "55999999997";
          token.role = "user";
        } else if (email === "julio@example.com") {
          token.perfil = "Júlio";
          token.responsavelChatId = "55999999996";
          token.role = "user";
        } else {
          token.perfil = "Confi";
          token.responsavelChatId = "";
          token.role = "user";
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.perfil = token.perfil as
        | "Confi"
        | "Cecília"
        | "Luiza"
        | "Júlio";
      session.user.responsavelChatId = token.responsavelChatId as string;
      session.user.role = token.role as "admin" | "user";
      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

// 🔹 Export para App Router
export { handler as GET, handler as POST };