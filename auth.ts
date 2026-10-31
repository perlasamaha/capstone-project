import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { findOrCreateOAuthUser, getSessionFields } from "@/lib/services/users";

// Provider credentials are read from AUTH_GITHUB_ID / AUTH_GITHUB_SECRET and
// AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET, and the cookie is encrypted with
// AUTH_SECRET.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub, Google],
  // No database adapter. The session lives in an encrypted JWT cookie and our
  // own User model is created/loaded in the jwt callback below, which keeps
  // the user document shaped the way the app needs it.
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  callbacks: {
    async jwt({ token, account, profile, user, trigger }) {
      // `account` is only present right after the OAuth flow succeeded.
      if (account && (account.provider === "github" || account.provider === "google")) {
        const dbUser = await findOrCreateOAuthUser({
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          name: user?.name,
          email: user?.email,
          image: user?.image,
          usernameHint: typeof profile?.login === "string" ? profile.login : null,
        });
        token.userId = dbUser.id;
        token.username = dbUser.username;
        token.name = dbUser.name;
        token.picture = dbUser.image;
      }

      // The settings page calls update() after saving. We re-read the user
      // from the database instead of trusting whatever the client sent.
      if (trigger === "update" && token.userId) {
        const fresh = await getSessionFields(token.userId);
        if (fresh) {
          token.username = fresh.username;
          token.name = fresh.name;
          token.picture = fresh.image;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId;
        session.user.username = token.username ?? "";
      }
      return session;
    },
  },
});
