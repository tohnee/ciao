import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");
      const isOnApiAuth = nextUrl.pathname.startsWith("/api/auth");
      const isOnTrial =
        nextUrl.pathname.startsWith("/trial") ||
        nextUrl.pathname.startsWith("/api/trial");

      if (isOnApiAuth) return true;
      if (isOnTrial) return true;

      if (isOnAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/home", nextUrl));
        return true;
      }

      if (!isLoggedIn) return false;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
