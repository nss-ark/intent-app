import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withSuperAdminAuth,
  type AuthSession,
} from "@/lib/api-helpers";

export const POST = withSuperAdminAuth(
  async (_request: NextRequest, context, _session: AuthSession) => {
    try {
      const { tenantId } = await context.params;

      const existing = await db.tenant.findUnique({ where: { id: tenantId } });
      if (!existing) {
        return apiError("NOT_FOUND", "Tenant not found", 404);
      }

      if (existing.status === "ACTIVE") {
        return apiError("CONFLICT", "Tenant is already active", 409);
      }

      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data: { status: "ACTIVE" },
      });

      return apiSuccess(tenant);
    } catch (error) {
      console.error("Error activating tenant:", error);
      return apiError("INTERNAL_ERROR", "Failed to activate tenant", 500);
    }
  },
  ["SUPER_ADMIN"]
);
