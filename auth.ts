// auth.ts

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Asynchronously fetches a server-side token by syncing the Google session.
 * @param idToken The Google ID token to be sent for verification.
 * @returns The server token if the sync is successful, otherwise null.
 */
async function syncSession(idToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: idToken }),
    });

    if (response.ok) {
      const data = await response.json() as { token?: string };
      console.log("Received token from server:", !!data.token);
      return typeof data.token === "string" ? data.token : null;
    } else {
      const errorText = await response.text();
      console.error("Failed sync response:", errorText);
      return null;
    }
  } catch (error) {
    console.error("Error in sync request:", error);
    return null;
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      // Ensure you request 'offline' access to get a refresh token
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
      // Initial sign-in
      if (account) {
        console.log("JWT callback: Initial sign-in");
        // Persist the OAuth access and refresh tokens in the JWT
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.expires_at = account.expires_at;

        // Sync with your backend to get the initial server token
        if (account.provider === "google" && account.id_token) {
            const serverToken = await syncSession(account.id_token);
            if (serverToken) {
                token.serverToken = serverToken;
            } else {
                token.error = "InitialSyncError";
            }
        }
        return token;
      }

      // Return previous token if the access token has not expired yet
      // We use a 5-minute buffer to proactively refresh
      if (Date.now() < ((token.expires_at as number) - 5 * 60) * 1000) {
        return token;
      }

      // If the access token has expired, try to refresh it
      console.log("JWT callback: Token has expired, attempting to refresh");
      if (!token.refreshToken) {
        console.error("No refresh token available.");
        token.error = "RefreshTokenError";
        return token;
      }

      try {
        const url = "https://oauth2.googleapis.com/token";
        const body = new URLSearchParams({
          client_id: process.env.AUTH_GOOGLE_ID!,
          client_secret: process.env.AUTH_GOOGLE_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken as string,
        });

        const response = await fetch(url, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          method: "POST",
          body,
        });

        const refreshedTokens = await response.json() as {
          id_token: string;
          expires_in: number;
          refresh_token?: string;
        };

        if (!response.ok) {
          throw refreshedTokens;
        }
        
        console.log("Successfully refreshed Google token");

        // Update the token with the new values from Google and clear any previous errors
        token.idToken = refreshedTokens.id_token;
        token.expires_at = Math.floor(Date.now() / 1000 + refreshedTokens.expires_in);
        token.refreshToken = refreshedTokens.refresh_token ?? token.refreshToken;
        token.error = undefined;

        // Re-sync with the backend using the new id_token
        console.log("Re-syncing session with new token");
        const newServerToken = await syncSession(token.idToken as string);
        if (newServerToken) {
            token.serverToken = newServerToken;
        } else {
            token.error = "RefreshSyncError";
        }

        return token;

      } catch (error) {
        console.error("Error refreshing access token:", error);
        token.error = "RefreshTokenError";
        return token;
      }
    },

    async session({ session, token }) {
      // Pass the custom properties from the JWT to the client-side session
      session.serverToken = token.serverToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
