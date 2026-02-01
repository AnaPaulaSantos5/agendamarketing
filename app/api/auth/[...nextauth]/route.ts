import NextAuth, { JWT } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

interface CustomToken extends JWT {
  perfil?: "Confi" | "Cecília" | "Luiza" | "Júlio";
  responsavelChatId?: string;
  role?: "admin" | "user";
}

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
      const customToken = token as CustomToken;

      if (profile?.email) {
        const email = profile.email.toLowerCase();

        if (email === "ana.paulinhacarneirosantos@gmail.com") {
          customToken.perfil = "Confi";
          customToken.responsavelChatId = "55999999999";
          customToken.role = "admin";
        } else {
          customToken.perfil = "Confi";
          customToken.responsavelChatId = "";
          customToken.role = "user";
        }
      }

      return { ...token, ...customToken };
    },

    async session({ session, token }) {
      session.user.perfil = (token as CustomToken).perfil || "Confi";
      session.user.responsavelChatId =
        (token as CustomToken).responsavelChatId || "";
      session.user.role = (token as CustomToken).role || "user";

      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };