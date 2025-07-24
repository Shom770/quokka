// auth.ts

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { decodeJwt } from "jose";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: persist tokens + decode sub
      if (account && account.provider === "google" && account.id_token) {
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expires_at = account.expires_at;

        // Decode Google 'sub' (unique user ID)
        const decoded = decodeJwt(account.id_token);
        if (decoded.sub && typeof decoded.sub === "string") {
          token.sub = decoded.sub;
        }
      }

      // If token still valid (with 5‑min buffer), return it
      if (token.expires_at && Date.now() < (token.expires_at - 5 * 60) * 1000) {
        return token;
      }

      // Otherwise, refresh the Google tokens
      if (!token.refreshToken) {
        token.error = "RefreshTokenError";
        return token;
      }

      try {
        const url = "https://oauth2.googleapis.com/token";
        const params = new URLSearchParams({
          client_id: process.env.AUTH_GOOGLE_ID!,
          client_secret: process.env.AUTH_GOOGLE_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken,
        });

        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params,
        });
        const refreshed = (await resp.json()) as {
          id_token: string;
          expires_in: number;
          refresh_token?: string;
        };
        if (!resp.ok || !refreshed.id_token) {
          throw new Error("Failed to refresh Google token");
        }

        token.idToken = refreshed.id_token;
        token.expires_at = Math.floor(Date.now() / 1000 + refreshed.expires_in);
        token.refreshToken = refreshed.refresh_token ?? token.refreshToken;
        delete token.error;

        // Decode sub again (should be the same)
        const decoded = decodeJwt(refreshed.id_token);
        if (decoded.sub && typeof decoded.sub === "string") {
          token.sub = decoded.sub;
        }

        return token;
      } catch (err) {
        console.error("Error refreshing Google token:", err);
        token.error = "RefreshTokenError";
        return token;
      }
    },

    async session({ session, token }) {
      // Expose the Google sub on the client session
      session.sub = token.sub;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
