import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // 🔗 MAPEAMENTO PERFIL
        const profileMap: Record<string, any> = {
          "luiza@email.com": {
            perfil: "Luiza",
            responsavelChatId: "55999999999",
          },
          "cecilia@email.com": {
            perfil: "Cecília",
            responsavelChatId: "55888888888",
          },
          "julio@email.com": {
            perfil: "Júlio",
            responsavelChatId: "55777777777",
          },
        };

        token.perfil =
          profileMap[user.email ?? ""]?.perfil ?? "Confi";

        token.responsavelChatId =
          profileMap[user.email ?? ""]?.responsavelChatId ?? "";
      }

      return token;
    },

    async session({ session, token }) {
      session.user.perfil = token.perfil;
      session.user.responsavelChatId = token.responsavelChatId;
      return session;
    },
  },
});

export { handler as GET, handler as POST };