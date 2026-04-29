import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { z } from "zod";

// ── Response Builders ─────���────────────────────────────────────────────

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

// ── Session Helpers ───────────────────���────────────────────────────────

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export type AuthSession = NonNullable<Awaited<ReturnType<typeof getAuthSession>>>;

// ── Request Parsing ─────────────────────────────────────────────────��──

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10) || 20)
  );
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

export async function parseBody<T>(
  request: NextRequest,
  schema: z.ZodType<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const raw = await request.json();
    const result = schema.safeParse(raw);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      return {
        data: null,
        error: apiError(
          "VALIDATION_ERROR",
          `${firstIssue.path.join(".")}: ${firstIssue.message}`,
          422
        ),
      };
    }
    return { data: result.data, error: null };
  } catch {
    return { data: null, error: apiError("INVALID_JSON", "Request body must be valid JSON", 400) };
  }
}

// ── Route Handler Wrappers ────────��────────────────────────────────────

type RouteContext = { params: Promise<Record<string, string>> };

type AuthenticatedHandler = (
  request: NextRequest,
  context: RouteContext,
  session: AuthSession
) => Promise<NextResponse>;

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Cache the demo session so we only query DB once
let _demoSession: AuthSession | null = null;

async function getDemoSession(): Promise<AuthSession | null> {
  if (_demoSession) return _demoSession;
  try {
    const user = await db.user.findFirst({
      where: { email: "arjun.mehta@isb.edu" },
    });
    if (!user) {
      console.warn("[demo] No demo user found (arjun.mehta@isb.edu)");
      return null;
    }
    _demoSession = {
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: "OWNER", // Demo mode: grant admin access for full app testing
        tenantId: user.tenantId,
        isSuperAdmin: false,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    };
    return _demoSession;
  } catch (err) {
    console.error("[demo] Failed to load demo session:", err);
    return null;
  }
}

/**
 * Wraps a route handler to require authentication.
 * In demo mode, injects a session for the first seeded user.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest, context: RouteContext) => {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      if (isDemoMode) {
        const demoSession = await getDemoSession();
        if (demoSession) return handler(request, context, demoSession);
      }
      return apiError("UNAUTHORIZED", "Not authenticated", 401);
    }

    return handler(request, context, session);
  };
}

const ADMIN_ROLES = ["OWNER", "OPERATOR", "MODERATOR"];

/**
 * Wraps a route handler to require admin authentication.
 * Optionally restrict to specific admin roles.
 */
export function withAdminAuth(handler: AuthenticatedHandler, requiredRoles?: string[]) {
  return withAuth(async (request, context, session) => {
    const roles = requiredRoles ?? ADMIN_ROLES;
    if (!roles.includes(session.user.role)) {
      return apiError("FORBIDDEN", "Admin access required", 403);
    }
    return handler(request, context, session);
  });
}

const SUPER_ADMIN_ROLES = ["SUPER_ADMIN", "SUPPORT", "FINANCE", "READ_ONLY"];

/**
 * Wraps a route handler to require superadmin authentication.
 * Optionally restrict to specific superadmin roles.
 */
export function withSuperAdminAuth(
  handler: AuthenticatedHandler,
  requiredRoles?: string[]
) {
  return withAuth(async (request, context, session) => {
    if (!(session.user as any).isSuperAdmin) {
      return apiError("FORBIDDEN", "SuperAdmin access required", 403);
    }
    const roles = requiredRoles ?? SUPER_ADMIN_ROLES;
    if (!roles.includes(session.user.role)) {
      return apiError("FORBIDDEN", "Insufficient superadmin privileges", 403);
    }
    return handler(request, context, session);
  });
}
