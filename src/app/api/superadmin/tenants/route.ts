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
  async (request: NextRequest, _context, _session: AuthSession) => {
    try {
      const searchParams = request.nextUrl.searchParams;
      const { page, pageSize, skip } = parsePagination(searchParams);
      const search = searchParams.get("search") ?? "";
      const status = searchParams.get("status");

      const where: Record<string, unknown> = {};

      if (search) {
        where.OR = [
          { slug: { contains: search, mode: "insensitive" } },
          { displayName: { contains: search, mode: "insensitive" } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [tenants, total] = await Promise.all([
        db.tenant.findMany({
          where,
          include: {
            _count: { select: { users: true, adminUsers: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        db.tenant.count({ where }),
      ]);

      return apiSuccess({
        tenants,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      });
    } catch (error) {
      console.error("Error fetching tenants:", error);
      return apiError("INTERNAL_ERROR", "Failed to fetch tenants", 500);
    }
  }
);

export const POST = withSuperAdminAuth(
  async (request: NextRequest, _context, _session: AuthSession) => {
    try {
      const body = await request.json();
      const { slug, displayName, planTier, contractStartDate, contractEndDate } = body;

      if (!slug || !displayName) {
        return apiError("VALIDATION_ERROR", "slug and displayName are required", 422);
      }

      const existing = await db.tenant.findUnique({ where: { slug } });
      if (existing) {
        return apiError("CONFLICT", "A tenant with this slug already exists", 409);
      }

      const tenant = await db.tenant.create({
        data: {
          slug,
          displayName,
          status: "TRIAL",
          planTier: planTier ?? null,
          contractStartDate: contractStartDate ? new Date(contractStartDate) : null,
          contractEndDate: contractEndDate ? new Date(contractEndDate) : null,
        },
      });

      return apiSuccess(tenant, 201);
    } catch (error) {
      console.error("Error creating tenant:", error);
      return apiError("INTERNAL_ERROR", "Failed to create tenant", 500);
    }
  },
  ["SUPER_ADMIN"]
);
