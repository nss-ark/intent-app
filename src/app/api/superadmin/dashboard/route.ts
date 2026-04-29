import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withSuperAdminAuth,
  type AuthSession,
} from "@/lib/api-helpers";

export const GET = withSuperAdminAuth(
  async (_request: NextRequest, _context, _session: AuthSession) => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        totalTenants,
        activeTenants,
        suspendedTenants,
        trialTenants,
        totalUsers,
        activeUsers,
        newUsersThisWeek,
      ] = await Promise.all([
        db.tenant.count(),
        db.tenant.count({ where: { status: "ACTIVE" } }),
        db.tenant.count({ where: { status: "SUSPENDED" } }),
        db.tenant.count({ where: { status: "TRIAL" } }),
        db.user.count({ where: { deletedAt: null } }),
        db.user.count({
          where: { deletedAt: null, lastActiveAt: { gte: thirtyDaysAgo } },
        }),
        db.user.count({
          where: { deletedAt: null, createdAt: { gte: sevenDaysAgo } },
        }),
      ]);

      return apiSuccess({
        totalTenants,
        tenantsByStatus: {
          ACTIVE: activeTenants,
          SUSPENDED: suspendedTenants,
          TRIAL: trialTenants,
        },
        totalUsers,
        activeUsers,
        newUsersThisWeek,
      });
    } catch (error) {
      console.error("Error fetching superadmin dashboard metrics:", error);
      return apiError(
        "INTERNAL_ERROR",
        "Failed to fetch dashboard metrics",
        500
      );
    }
  }
);
