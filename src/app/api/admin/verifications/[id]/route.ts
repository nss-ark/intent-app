import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  parseBody,
  withAdminAuth,
  type AuthSession,
} from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

export const GET = withAdminAuth(
  async (_request: NextRequest, context, _session: AuthSession) => {
    try {
      const { id } = await context.params as { id: string };

      const verification = await db.verificationRequest.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              photoUrl: true,
              program: true,
              graduationYear: true,
            },
          },
          evidenceFiles: true,
          reviewedByAdmin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!verification) {
        return apiError("NOT_FOUND", "Verification request not found", 404);
      }

      return apiSuccess(verification);
    } catch (error) {
      console.error("Error fetching verification:", error);
      return apiError("INTERNAL_ERROR", "Failed to fetch verification", 500);
    }
  }
);

const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "INFO_REQUESTED"]),
  adminNotes: z.string().optional(),
});

export const PATCH = withAdminAuth(
  async (request: NextRequest, context, session: AuthSession) => {
    try {
      const { id } = await context.params as { id: string };

      const parsed = await parseBody(request, reviewSchema);
      if (parsed.error) return parsed.error;
      const { status, adminNotes } = parsed.data;

      // Find the verification request
      const verification = await db.verificationRequest.findUnique({
        where: { id },
      });

      if (!verification) {
        return apiError("NOT_FOUND", "Verification request not found", 404);
      }

      // Find the admin user for this session
      const adminUser = await db.adminUser.findUnique({
        where: { userId: session.user.id },
      });

      if (!adminUser) {
        return apiError("FORBIDDEN", "Admin user record not found", 403);
      }

      // Update the verification in a transaction
      const updated = await db.$transaction(async (tx) => {
        const updatedVerification = await tx.verificationRequest.update({
          where: { id },
          data: {
            status,
            adminNotes: adminNotes ?? null,
            reviewedByAdminId: adminUser.id,
            reviewedAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });

        // If approved and request type is badge-related, create UserBadge
        if (status === "APPROVED") {
          // Check if requestType maps to a badge
          const tenantBadge = await tx.tenantBadge.findFirst({
            where: {
              template: {
                code: verification.requestType,
              },
              isActive: true,
            },
          });

          if (tenantBadge) {
            await tx.userBadge.create({
              data: {
                userId: verification.userId,
                tenantBadgeId: tenantBadge.id,
                awardedByAdminId: adminUser.id,
                verificationRequestId: verification.id,
              },
            });
          }
        }

        return updatedVerification;
      });

      logAudit({
        actorAdminId: adminUser.id,
        action: AuditActions.ADMIN_VERIFICATION_REVIEWED,
        targetType: "VerificationRequest",
        targetId: id,
        payload: { status, adminNotes },
        ...requestMeta(request),
      });

      return apiSuccess(updated);
    } catch (error) {
      console.error("Error reviewing verification:", error);
      return apiError("INTERNAL_ERROR", "Failed to review verification", 500);
    }
  }
);
