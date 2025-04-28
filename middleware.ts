import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl, auth: userAuth } = req;
  const path = nextUrl.pathname;

  // Paths that don’t require login
  const publicPaths = ["/login", "/api/auth"];

  const isAuthenticated = !!userAuth?.user;
  const isPublicPath = publicPaths.some(
    (pp) => path === pp || path.startsWith(`${pp}/`)
  );

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }
  if (isAuthenticated && path === "/login") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Protect everything except static files, the auth API, and the login page
     */
    "/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)",
  ],
};