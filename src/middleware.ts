import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiRateLimit, authRateLimit } from "@/lib/rate-limit";

const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/signup/verify",
  "/signup/consent",
  "/onboarding",
  "/onboarding/step1",
  "/onboarding/step2",
  "/onboarding/step3",
  "/onboarding/step4",
  "/onboarding/complete",
  "/admin/login",
  "/superadmin/login",
];

const publicPrefixes = ["/api/auth/", "/_next/", "/favicon.ico"];

// Demo mode: set NEXT_PUBLIC_DEMO_MODE=true to allow browsing without auth
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const limiter = pathname.startsWith("/api/auth/") ? authRateLimit : apiRateLimit;
    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return rateLimitResponse;
  }

  // In demo mode, allow all routes without auth
  if (isDemoMode) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "intent-dev-secret-change-in-production",
  });

  if (!token) {
    // API routes return 401 JSON instead of redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/superadmin") && pathname !== "/superadmin/login") {
    if (!token.isSuperAdmin) {
      return NextResponse.redirect(new URL("/superadmin/login", request.url));
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminRoles = ["OWNER", "OPERATOR", "MODERATOR"];
    if (!adminRoles.includes(token.role)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
