import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that do not require authentication
const publicPaths = ["/", "/login", "/signup"];

// Prefix patterns that are always public
const publicPrefixes = ["/api/auth/", "/_next/", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public prefixes (auth API, static assets)
  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow exact public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Get the JWT token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "intent-dev-secret-change-in-production",
  });

  // Not authenticated -> redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require an admin role
  if (pathname.startsWith("/(admin)") || pathname.startsWith("/admin")) {
    const adminRoles = ["OWNER", "OPERATOR", "MODERATOR"];
    if (!adminRoles.includes(token.role)) {
      // Non-admin user trying to access admin routes -> redirect to app home
      return NextResponse.redirect(new URL("/discover", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
