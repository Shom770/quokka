// types/next-auth.d.ts

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    /** Google’s subject (unique user ID) */
    sub?: string;
    serverToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    idToken?: string;
    refreshToken?: string;
    expires_at?: number;
    serverToken?: string;
    error?: string;
  }
}
