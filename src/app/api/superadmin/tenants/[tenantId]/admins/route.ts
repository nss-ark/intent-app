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

      const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) {
        return apiError("NOT_FOUND", "Tenant not found", 404);
      }

      const admins = await db.adminUser.findMany({
        where: { tenantId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              photoUrl: true,
              lastActiveAt: true,
            },
          },
        },
        orderBy: { invitedAt: "desc" },
      });

      return apiSuccess({ admins });
    } catch (error) {
      console.error("Error fetching tenant admins:", error);
      return apiError("INTERNAL_ERROR", "Failed to fetch tenant admins", 500);
    }
  }
);
