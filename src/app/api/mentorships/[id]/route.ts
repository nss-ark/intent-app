import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parseBody,
} from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

// ── Shared selects ──────────────────────────────────────────────────

const userSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
  email: true,
  profile: {
    select: {
      missionStatement: true,
      domain: { select: { id: true, code: true, displayName: true } },
    },
  },
  niches: {
    include: { niche: true },
    orderBy: { position: "asc" as const },
  },
} as const;

// ── GET /api/mentorships/[id] ───────────────────────────────────────

export const GET = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params;

    const mentorship = await db.mentorship.findUnique({
      where: { id },
      include: {
        mentor: { select: userSelect },
        mentee: { select: userSelect },
        sessions: {
          orderBy: { sessionNumber: "asc" },
        },
        conversation: {
          select: { id: true, lastMessageAt: true },
        },
      },
    });

    if (!mentorship) {
      return apiError("NOT_FOUND", "Mentorship not found", 404);
    }

    if (
      mentorship.mentorUserId !== session.user.id &&
      mentorship.menteeUserId !== session.user.id
    ) {
      return apiError("FORBIDDEN", "Not authorised to view this mentorship", 403);
    }

    return apiSuccess({
      ...mentorship,
      myRole: mentorship.mentorUserId === session.user.id ? "MENTOR" : "MENTEE",
    });
  } catch (error) {
    console.error("Error fetching mentorship:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch mentorship", 500);
  }
});

// ── PATCH /api/mentorships/[id] ─────────────────────────────────────

const updateSchema = z.object({
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED"]).optional(),
  goal: z.string().max(500).optional(),
  cadence: z.enum(["EVERY_2_WEEKS", "MONTHLY", "AD_HOC"]).optional(),
});

export const PATCH = withAuth(async (request, context, session) => {
  try {
    const { id } = await context.params;

    const parsed = await parseBody(request, updateSchema);
    if (parsed.error) return parsed.error;
    const updates = parsed.data;

    if (Object.keys(updates).length === 0) {
      return apiError("VALIDATION_ERROR", "No fields to update", 422);
    }

    const mentorship = await db.mentorship.findUnique({
      where: { id },
    });

    if (!mentorship) {
      return apiError("NOT_FOUND", "Mentorship not found", 404);
    }

    const userId = session.user.id;
    if (
      mentorship.mentorUserId !== userId &&
      mentorship.menteeUserId !== userId
    ) {
      return apiError("FORBIDDEN", "Not authorised to update this mentorship", 403);
    }

    const data: Record<string, unknown> = { ...updates };

    // Handle status transitions
    if (updates.status === "COMPLETED") {
      data.endedAt = new Date();
      data.completionReason = "USER_COMPLETED";
    }

    const updated = await db.mentorship.update({
      where: { id },
      data,
      include: {
        mentor: { select: userSelect },
        mentee: { select: userSelect },
        conversation: { select: { id: true } },
      },
    });

    logAudit({
      actorUserId: userId,
      action: AuditActions.MENTORSHIP_UPDATED,
      targetType: "Mentorship",
      targetId: id,
      payload: updates,
      ...requestMeta(request),
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Error updating mentorship:", error);
    return apiError("INTERNAL_ERROR", "Failed to update mentorship", 500);
  }
});
