import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  parsePagination,
  withSuperAdminAuth,
  type AuthSession,
} from "@/lib/api-helpers";

export const GET = withSuperAdminAuth(
  async (request: NextRequest, context, _session: AuthSession) => {
    try {
      const { tenantId } = await context.params;
      const searchParams = request.nextUrl.searchParams;
      const { page, pageSize, skip } = parsePagination(searchParams);
      const search = searchParams.get("search") ?? "";

      const where: Record<string, unknown> = {
        tenantId,
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            photoUrl: true,
            userType: true,
            authProvider: true,
            tenantId: true,
            createdAt: true,
            updatedAt: true,
            lastActiveAt: true,
            deletedAt: true,
            suspendedUntil: true,
            suspensionReason: true,
            graduationYear: true,
            program: true,
            institutionMemberStatus: true,
            profile: true,
            _count: { select: { badges: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        db.user.count({ where }),
      ]);

      return apiSuccess({
        users,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      });
    } catch (error) {
      console.error("Error fetching tenant users:", error);
      return apiError("INTERNAL_ERROR", "Failed to fetch tenant users", 500);
    }
  }
);
