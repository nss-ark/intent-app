import type { AuthSession } from "@/lib/api-helpers";

/**
 * Extract tenantId from the authenticated session.
 * In the future, this may resolve from subdomain for Postgres schema-per-tenant.
 */
export function getTenantId(session: AuthSession): string {
  return session.user.tenantId;
}

/** Prisma where clause for soft-delete filtering */
export function notDeleted() {
  return { deletedAt: null } as const;
}

/** Prisma where clause combining tenant scoping + soft-delete */
export function withTenantAndActive(session: AuthSession) {
  return {
    tenantId: getTenantId(session),
    deletedAt: null,
  } as const;
}

/** Prisma where clause for tenant scoping only (includes soft-deleted) */
export function withTenant(session: AuthSession) {
  return {
    tenantId: getTenantId(session),
  } as const;
}
