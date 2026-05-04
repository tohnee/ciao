import type { NextAuthConfig } from "next-auth";

const DISABLED_FEATURES = [
  "/agents",
  "/marketplace",
  "/skills",
  "/teams",
  "/subscriptions",
  "/buy",
  "/sell",
  "/api/agents",
  "/api/marketplace",
  "/api/skills",
  "/api/teams",
  "/api/subscriptions",
];

function isDisabled(path: string): boolean {
  return DISABLED_FEATURES.some((p) => path === p || path.startsWith(p + "/"));
}

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      if (isDisabled(nextUrl.pathname)) {
        return new Response(null, { status: 404, statusText: "Not Available" });
      }

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
