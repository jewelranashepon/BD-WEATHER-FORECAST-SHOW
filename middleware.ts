import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const session = getSessionCookie(request);

  const { pathname } = request.nextUrl;

  type RoutePrefix = `/${string}/`;
  const authRoutePrefix = ["/sign-in", "/sign-up"];
  const protectedRoutePrefix: RoutePrefix[] = ["/dashboard/"];

  const isAuthRoute = authRoutePrefix.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isProtectedRoute =
    pathname == "/dashboard" ||
    protectedRoutePrefix.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
