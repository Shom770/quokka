import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign-in
      if (account && user) {
        console.log("JWT callback with account:", !!account.id_token);
        
        if (account.provider === "google" && account.id_token) {
          try {
            const response = await fetch(`${process.env.API_URL}/sync/session`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ credential: account.id_token }),
            });
                        
            if (response.ok) {
              const data = await response.json();
              console.log("Received token from server:", !!data.token);
              return { ...token, serverToken: data.token };
            } else {
              const errorText = await response.text();
              console.error("Failed sync response:", errorText);
            }
          } catch (error) {
            console.error("Error in sync request:", error);
          }
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (token.serverToken) {
        session.serverToken = token.serverToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});