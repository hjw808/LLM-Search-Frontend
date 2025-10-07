import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to sign-in and error pages
    if (path.startsWith("/auth/")) {
      return NextResponse.next();
    }

    // If not authenticated, redirect to sign-in
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(signInUrl);
    }

    // If authenticated but onboarding not completed, redirect to onboarding
    if (!token.onboardingCompleted && path !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // If onboarding completed but trying to access onboarding page, redirect to test
    if (token.onboardingCompleted && path === "/onboarding") {
      return NextResponse.redirect(new URL("/test", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    "/test/:path*",
    "/reports/:path*",
    "/onboarding/:path*",
    "/account/:path*",
    "/pricing/:path*",
  ],
};
