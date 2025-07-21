// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

/**
 * Extends the built-in session and JWT types to include the custom properties
 * we are adding.
 */

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    serverToken?: string;
    error?: string; // To communicate errors to the client
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    // These properties are added upon initial sign-in
    idToken?: string;
    refreshToken?: string;
    expires_at?: number;

    // This is the custom token from our backend
    serverToken?: string;

    // This property is used to pass potential errors to the session
    error?: string;
  }
}
