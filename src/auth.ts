import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      username: string | null;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [GitHub],
  callbacks: {
    async signIn({ user, profile }) {
      if (profile?.login && user.id) {
        await db
          .update(users)
          .set({ username: profile.login as string })
          .where(eq(users.id, user.id));
      }
      return true;
    },
    async session({ session, user }) {
      const [dbUser] = await db
        .select({ username: users.username })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      session.user.id = user.id;
      session.user.username = dbUser?.username ?? null;
      return session;
    },
  },
});
