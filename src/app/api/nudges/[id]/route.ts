import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parseBody,
} from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

const userSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
  profile: { select: { missionStatement: true } },
} as const;

const nudgeIncludes = {
  sender: { select: userSelect },
  receiver: { select: userSelect },
  signals: {
    include: {
      tenantSignal: { include: { template: true } },
    },
  },
  conversation: true,
} as const;

// ── GET /api/nudges/[id] ────────────────────────────────────────────

export const GET = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params;

    const nudge = await db.nudge.findUnique({
      where: { id },
      include: nudgeIncludes,
    });

    if (!nudge) {
      return apiError("NOT_FOUND", "Nudge not found", 404);
    }

    // Only sender or receiver may view
    if (
      nudge.senderUserId !== session.user.id &&
      nudge.receiverUserId !== session.user.id
    ) {
      return apiError("FORBIDDEN", "Not authorised to view this nudge", 403);
    }

    return apiSuccess(nudge);
  } catch (error) {
    console.error("Error fetching nudge:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch nudge", 500);
  }
});

// ── PATCH /api/nudges/[id] ──────────────────────────────────────────

const respondSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

export const PATCH = withAuth(async (request, context, session) => {
  try {
    const { id } = await context.params;

    const parsed = await parseBody(request, respondSchema);
    if (parsed.error) return parsed.error;
    const { status } = parsed.data;

    const nudge = await db.nudge.findUnique({
      where: { id },
    });

    if (!nudge) {
      return apiError("NOT_FOUND", "Nudge not found", 404);
    }

    // Only the receiver can respond
    if (nudge.receiverUserId !== session.user.id) {
      return apiError("FORBIDDEN", "Only the receiver can respond", 403);
    }

    // Must be in SENT status
    if (nudge.status !== "SENT") {
      return apiError(
        "INVALID_STATE",
        "This nudge has already been responded to",
        409
      );
    }

    const now = new Date();

    if (status === "ACCEPTED") {
      // Determine alphabetical ordering for conversation participants
      const [userAId, userBId] =
        nudge.senderUserId < nudge.receiverUserId
          ? [nudge.senderUserId, nudge.receiverUserId]
          : [nudge.receiverUserId, nudge.senderUserId];

      const updated = await db.$transaction(async (tx) => {
        // Create (or find existing) conversation
        const conversation = await tx.conversation.upsert({
          where: {
            userAId_userBId: { userAId, userBId },
          },
          create: {
            userAId,
            userBId,
            originatedFromNudgeId: nudge.id,
          },
          update: {},
        });

        const result = await tx.nudge.update({
          where: { id },
          data: {
            status: "ACCEPTED",
            respondedAt: now,
            conversationId: conversation.id,
          },
          include: nudgeIncludes,
        });

        // Update relationship outcome
        await tx.nudgeRelationship.upsert({
          where: {
            senderUserId_receiverUserId: {
              senderUserId: nudge.senderUserId,
              receiverUserId: nudge.receiverUserId,
            },
          },
          create: {
            senderUserId: nudge.senderUserId,
            receiverUserId: nudge.receiverUserId,
            lastNudgedAt: nudge.sentAt,
            countLifetime: 1,
            lastOutcome: "ACCEPTED",
          },
          update: {
            lastOutcome: "ACCEPTED",
          },
        });

        return result;
      });

      logAudit({
        actorUserId: session.user.id,
        action: AuditActions.NUDGE_ACCEPTED,
        targetType: "Nudge",
        targetId: id,
        payload: { conversationId: updated.conversationId },
        ...requestMeta(request),
      });

      return apiSuccess(updated);
    }

    // DECLINED
    const cooldownUntil = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const updated = await db.$transaction(async (tx) => {
      const result = await tx.nudge.update({
        where: { id },
        data: {
          status: "DECLINED",
          respondedAt: now,
        },
        include: nudgeIncludes,
      });

      await tx.nudgeRelationship.upsert({
        where: {
          senderUserId_receiverUserId: {
            senderUserId: nudge.senderUserId,
            receiverUserId: nudge.receiverUserId,
          },
        },
        create: {
          senderUserId: nudge.senderUserId,
          receiverUserId: nudge.receiverUserId,
          lastNudgedAt: nudge.sentAt,
          countLifetime: 1,
          lastOutcome: "DECLINED",
          cooldownUntil,
        },
        update: {
          lastOutcome: "DECLINED",
          cooldownUntil,
        },
      });

      return result;
    });

    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.NUDGE_DECLINED,
      targetType: "Nudge",
      targetId: id,
      ...requestMeta(request),
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Error responding to nudge:", error);
    return apiError("INTERNAL_ERROR", "Failed to respond to nudge", 500);
  }
});
