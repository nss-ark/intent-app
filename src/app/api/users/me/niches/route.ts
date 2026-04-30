import { z } from "zod";
import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth, parseBody } from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

const nichesUpdateSchema = z.object({
  nicheIds: z
    .array(z.string().min(1, "Niche ID is required"))
    .min(1, "At least one niche is required")
    .max(5, "Maximum 5 niches allowed"),
});

export const PUT = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, nichesUpdateSchema);
    if (parsed.error) return parsed.error;

    const { nicheIds } = parsed.data;

    // Verify all niches exist and are active
    const niches = await db.niche.findMany({
      where: { id: { in: nicheIds }, isActive: true },
      select: { id: true, displayName: true },
    });

    if (niches.length !== nicheIds.length) {
      return apiError(
        "VALIDATION_ERROR",
        "One or more niche IDs are invalid or inactive",
        422
      );
    }

    // Replace user niches in a transaction
    await db.$transaction(async (tx) => {
      await tx.userNiche.deleteMany({
        where: { userId: session.user.id },
      });

      await tx.userNiche.createMany({
        data: nicheIds.map((nicheId, index) => ({
          userId: session.user.id,
          nicheId,
          position: index + 1,
        })),
      });
    });

    // Build response with displayName in position order
    const nicheMap = new Map(niches.map((n) => [n.id, n.displayName]));
    const updatedNiches = nicheIds.map((id, index) => ({
      nicheId: id,
      displayName: nicheMap.get(id)!,
      position: index + 1,
    }));

    // Audit log (fire-and-forget)
    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.PROFILE_UPDATED,
      targetType: "UserNiche",
      targetId: session.user.id,
      payload: { nicheIds, nicheCount: nicheIds.length },
      ...requestMeta(request),
    });

    return apiSuccess(updatedNiches);
  } catch (error) {
    console.error("Niches PUT error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update niches", 500);
  }
});
