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

const fullUserSelect = {
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
  openSignals: {
    where: { isOpen: true },
    include: {
      tenantSignal: { include: { template: true } },
    },
  },
  badges: {
    where: { isVisible: true },
    include: {
      tenantBadge: { include: { template: true } },
    },
  },
} as const;

// ── GET /api/matches/[id] ───────────────────────────────────────────

export const GET = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params;

    const match = await db.match.findUnique({
      where: { id },
      include: {
        userA: { select: fullUserSelect },
        userB: { select: fullUserSelect },
        conversation: { select: { id: true } },
        mentorship: { select: { id: true, status: true } },
      },
    });

    if (!match) {
      return apiError("NOT_FOUND", "Match not found", 404);
    }

    if (
      match.userAId !== session.user.id &&
      match.userBId !== session.user.id
    ) {
      return apiError("FORBIDDEN", "Not authorised to view this match", 403);
    }

    return apiSuccess(match);
  } catch (error) {
    console.error("Error fetching match:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch match", 500);
  }
});

// ── PATCH /api/matches/[id] ─────────────────────────────────────────

const respondSchema = z.object({
  action: z.enum(["ACCEPTED", "DECLINED"]),
});

export const PATCH = withAuth(async (request, context, session) => {
  try {
    const { id } = await context.params;

    const parsed = await parseBody(request, respondSchema);
    if (parsed.error) return parsed.error;
    const { action } = parsed.data;

    const match = await db.match.findUnique({ where: { id } });

    if (!match) {
      return apiError("NOT_FOUND", "Match not found", 404);
    }

    const userId = session.user.id;
    const isUserA = match.userAId === userId;
    const isUserB = match.userBId === userId;

    if (!isUserA && !isUserB) {
      return apiError("FORBIDDEN", "Not authorised to respond to this match", 403);
    }

    // Must be in PENDING or NOTIFIED state
    if (!["PENDING", "NOTIFIED"].includes(match.status)) {
      return apiError(
        "INVALID_STATE",
        "This match is no longer awaiting a response",
        409
      );
    }

    const myCurrentStatus = isUserA ? match.userAStatus : match.userBStatus;
    if (myCurrentStatus !== "PENDING") {
      return apiError(
        "INVALID_STATE",
        "You have already responded to this match",
        409
      );
    }

    const now = new Date();
    const statusField = isUserA ? "userAStatus" : "userBStatus";
    const otherStatus = isUserA ? match.userBStatus : match.userAStatus;

    if (action === "DECLINED") {
      const updated = await db.match.update({
        where: { id },
        data: {
          [statusField]: "DECLINED",
          status: "CANCELLED",
        },
      });

      logAudit({
        actorUserId: userId,
        action: AuditActions.MATCH_DECLINED,
        targetType: "Match",
        targetId: id,
        ...requestMeta(request),
      });

      return apiSuccess(updated);
    }

    // ACCEPTED
    const bothAccepted = otherStatus === "ACCEPTED";

    const updated = await db.$transaction(async (tx) => {
      const data: Record<string, unknown> = {
        [statusField]: "ACCEPTED",
      };

      if (bothAccepted) {
        data.status = "ACTIVE";
        data.acceptedAt = now;
      }

      const result = await tx.match.update({
        where: { id },
        data,
      });

      if (bothAccepted) {
        // Determine alphabetical ordering for conversation
        const [convUserAId, convUserBId] =
          match.userAId < match.userBId
            ? [match.userAId, match.userBId]
            : [match.userBId, match.userAId];

        // Create conversation linked to this match
        const conversation = await tx.conversation.upsert({
          where: { userAId_userBId: { userAId: convUserAId, userBId: convUserBId } },
          create: {
            userAId: convUserAId,
            userBId: convUserBId,
            matchId: match.id,
          },
          update: {},
        });

        // If mentorship match, create Mentorship record
        if (match.matchType === "MENTORSHIP") {
          const existingMentorship = await tx.mentorship.findUnique({
            where: { matchId: match.id },
          });

          if (!existingMentorship) {
            await tx.mentorship.create({
              data: {
                conversationId: conversation.id,
                mentorUserId: match.userAId,
                menteeUserId: match.userBId,
                proposedByUserId: match.userAId,
                status: "ACTIVE",
                matchId: match.id,
                startedAt: now,
              },
            });
          }
        }

        // Create notifications for both users
        await tx.notification.createMany({
          data: [
            {
              userId: match.userAId,
              type: "MATCH_ACTIVATED",
              title: "Match accepted!",
              body: "Both of you accepted the match. Start a conversation now!",
              relatedEntityType: "Match",
              relatedEntityId: match.id,
            },
            {
              userId: match.userBId,
              type: "MATCH_ACTIVATED",
              title: "Match accepted!",
              body: "Both of you accepted the match. Start a conversation now!",
              relatedEntityType: "Match",
              relatedEntityId: match.id,
            },
          ],
        });
      }

      return result;
    });

    logAudit({
      actorUserId: userId,
      action: AuditActions.MATCH_ACCEPTED,
      targetType: "Match",
      targetId: id,
      payload: { bothAccepted },
      ...requestMeta(request),
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Error responding to match:", error);
    return apiError("INTERNAL_ERROR", "Failed to respond to match", 500);
  }
});
