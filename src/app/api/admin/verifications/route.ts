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
      const status = searchParams.get("status"); // pending | reviewed | all

      // Build where clause
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (status === "pending") {
        where.status = { in: ["SUBMITTED", "IN_REVIEW"] };
      } else if (status === "reviewed") {
        where.status = { in: ["APPROVED", "REJECTED", "INFO_REQUESTED"] };
      }
      // "all" or unset: no filter

      const [verifications, total] = await Promise.all([
        db.verificationRequest.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                photoUrl: true,
              },
            },
            evidenceFiles: true,
          },
          orderBy: { submittedAt: "desc" },
          skip,
          take: pageSize,
        }),
        db.verificationRequest.count({ where }),
      ]);

      return apiSuccess({
        items: verifications,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    } catch (error) {
      console.error("Error listing verifications:", error);
      return apiError("INTERNAL_ERROR", "Failed to list verifications", 500);
    }
  }
);
