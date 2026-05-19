import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

/** Bcrypt hashes contain `$` which Next.js .env expands and corrupts. Use ADMIN_PASSWORD_B64 instead. */
function getAdminPasswordHash(): string | undefined {
  const b64 = process.env.ADMIN_PASSWORD_B64;
  if (b64) {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  return process.env.ADMIN_PASSWORD;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPasswordHash = getAdminPasswordHash();

        if (!adminUsername || !adminPasswordHash || !credentials?.username || !credentials?.password) {
          return null;
        }

        if (credentials.username !== adminUsername) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          adminPasswordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: "admin",
          name: adminUsername,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
