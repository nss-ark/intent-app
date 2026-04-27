import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAdminAuth,
  parsePagination,
  type AuthSession,
} from "@/lib/api-helpers";

export const GET = withAdminAuth(
  async (request: NextRequest, _context, _session: AuthSession) => {
    try {
      const { searchParams } = request.nextUrl;
      const { page, pageSize, skip } = parsePagination(searchParams);
      const search = searchParams.get("search") ?? "";
      const status = searchParams.get("status"); // active | suspended | deleted

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (status === "active") {
        where.deletedAt = null;
        where.suspendedUntil = null;
      } else if (status === "suspended") {
        where.suspendedUntil = { not: null };
      } else if (status === "deleted") {
        where.deletedAt = { not: null };
      }

      // SQLite doesn't support mode: 'insensitive' on contains
      if (search) {
        where.OR = [
          { fullName: { contains: search } },
          { email: { contains: search } },
        ];
      }

      const [members, total] = await Promise.all([
        db.user.findMany({
          where,
          include: {
            profile: true,
            badges: {
              include: {
                tenantBadge: {
                  include: { template: true },
                },
              },
              where: { isVisible: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        db.user.count({ where }),
      ]);

      // Strip hashedPassword
      const safeMembers = members.map(({ hashedPassword: _, ...user }) => user);

      return apiSuccess({
        items: safeMembers,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      console.error("Error listing members:", error);
      return apiError("INTERNAL_ERROR", "Failed to list members", 500);
    }
  }
);
