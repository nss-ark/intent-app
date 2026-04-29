import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withSuperAdminAuth,
  type AuthSession,
} from "@/lib/api-helpers";

export const GET = withSuperAdminAuth(
  async (_request: NextRequest, context, _session: AuthSession) => {
    try {
      const { tenantId } = await context.params;

      const tenant = await db.tenant.findUnique({
        where: { id: tenantId },
        include: {
          _count: { select: { users: true, adminUsers: true } },
        },
      });

      if (!tenant) {
        return apiError("NOT_FOUND", "Tenant not found", 404);
      }

      return apiSuccess(tenant);
    } catch (error) {
      console.error("Error fetching tenant:", error);
      return apiError("INTERNAL_ERROR", "Failed to fetch tenant", 500);
    }
  }
);

export const PATCH = withSuperAdminAuth(
  async (request: NextRequest, context, _session: AuthSession) => {
    try {
      const { tenantId } = await context.params;

      const existing = await db.tenant.findUnique({ where: { id: tenantId } });
      if (!existing) {
        return apiError("NOT_FOUND", "Tenant not found", 404);
      }

      const body = await request.json();
      const { displayName, planTier, contractStartDate, contractEndDate, settings } = body;

      const data: Record<string, unknown> = {};
      if (displayName !== undefined) data.displayName = displayName;
      if (planTier !== undefined) data.planTier = planTier;
      if (contractStartDate !== undefined)
        data.contractStartDate = contractStartDate ? new Date(contractStartDate) : null;
      if (contractEndDate !== undefined)
        data.contractEndDate = contractEndDate ? new Date(contractEndDate) : null;
      if (settings !== undefined)
        data.settings = typeof settings === "string" ? settings : JSON.stringify(settings);

      const tenant = await db.tenant.update({
        where: { id: tenantId },
        data,
      });

      return apiSuccess(tenant);
    } catch (error) {
      console.error("Error updating tenant:", error);
      return apiError("INTERNAL_ERROR", "Failed to update tenant", 500);
    }
  },
  ["SUPER_ADMIN"]
);
