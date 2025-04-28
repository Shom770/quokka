// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    serverToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    serverToken?: string;
  }
}