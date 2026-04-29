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

const memberUserSelect = {
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

// ── GET /api/group-matches/[id] ─────────────────────────────────────

export const GET = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params;

    const groupMatch = await db.groupMatch.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: memberUserSelect },
          },
        },
        niches: {
          include: { niche: true },
        },
        groupConversation: {
          select: { id: true },
        },
      },
    });

    if (!groupMatch) {
      return apiError("NOT_FOUND", "Group match not found", 404);
    }

    const isMember = groupMatch.members.some(
      (m) => m.userId === session.user.id
    );
    if (!isMember) {
      return apiError("FORBIDDEN", "Not authorised to view this group match", 403);
    }

    return apiSuccess(groupMatch);
  } catch (error) {
    console.error("Error fetching group match:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch group match", 500);
  }
});

// ── PATCH /api/group-matches/[id] ───────────────────────────────────

const respondSchema = z.object({
  action: z.enum(["ACCEPTED", "DECLINED"]),
});

/** Minimum accepted members required to activate a group */
const MIN_ACCEPTED_TO_ACTIVATE = 2;

export const PATCH = withAuth(async (request, context, session) => {
  try {
    const { id } = await context.params;

    const parsed = await parseBody(request, respondSchema);
    if (parsed.error) return parsed.error;
    const { action } = parsed.data;

    const userId = session.user.id;

    const groupMatch = await db.groupMatch.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!groupMatch) {
      return apiError("NOT_FOUND", "Group match not found", 404);
    }

    const myMembership = groupMatch.members.find((m) => m.userId === userId);
    if (!myMembership) {
      return apiError("FORBIDDEN", "Not authorised to respond to this group match", 403);
    }

    if (myMembership.status !== "PENDING") {
      return apiError(
        "INVALID_STATE",
        "You have already responded to this group match",
        409
      );
    }

    if (!["PENDING", "NOTIFIED"].includes(groupMatch.status)) {
      return apiError(
        "INVALID_STATE",
        "This group match is no longer awaiting responses",
        409
      );
    }

    const now = new Date();

    if (action === "DECLINED") {
      await db.groupMatchMember.update({
        where: {
          groupMatchId_userId: { groupMatchId: id, userId },
        },
        data: {
          status: "DECLINED",
          respondedAt: now,
        },
      });

      logAudit({
        actorUserId: userId,
        action: AuditActions.GROUP_MATCH_DECLINED,
        targetType: "GroupMatch",
        targetId: id,
        ...requestMeta(request),
      });

      return apiSuccess({ groupMatchId: id, myStatus: "DECLINED" });
    }

    // ACCEPTED
    const updated = await db.$transaction(async (tx) => {
      await tx.groupMatchMember.update({
        where: {
          groupMatchId_userId: { groupMatchId: id, userId },
        },
        data: {
          status: "ACCEPTED",
          respondedAt: now,
        },
      });

      // Re-fetch members to count accepted (including the one we just updated)
      const allMembers = await tx.groupMatchMember.findMany({
        where: { groupMatchId: id },
      });

      const acceptedMembers = allMembers.filter(
        (m) => m.status === "ACCEPTED"
      );
      const acceptedCount = acceptedMembers.length;

      let groupConversationId: string | null = null;

      if (
        acceptedCount >= MIN_ACCEPTED_TO_ACTIVATE &&
        groupMatch.status !== "ACTIVE"
      ) {
        // Activate the group
        await tx.groupMatch.update({
          where: { id },
          data: {
            status: "ACTIVE",
            activatedAt: now,
          },
        });

        // Create group conversation if not exists
        let groupConversation = await tx.groupConversation.findUnique({
          where: { groupMatchId: id },
        });

        if (!groupConversation) {
          groupConversation = await tx.groupConversation.create({
            data: {
              groupMatchId: id,
              name: null,
            },
          });
        }

        groupConversationId = groupConversation.id;

        // Add all accepted members to the conversation
        for (const member of acceptedMembers) {
          const existing = await tx.groupConversationMember.findUnique({
            where: {
              groupConversationId_userId: {
                groupConversationId: groupConversation.id,
                userId: member.userId,
              },
            },
          });

          if (!existing) {
            await tx.groupConversationMember.create({
              data: {
                groupConversationId: groupConversation.id,
                userId: member.userId,
              },
            });
          }
        }

        // Notify all accepted members
        await tx.notification.createMany({
          data: acceptedMembers.map((m) => ({
            userId: m.userId,
            type: "GROUP_MATCH_ACTIVATED",
            title: "Group match activated!",
            body: "Enough members accepted. Your group conversation is ready.",
            relatedEntityType: "GroupMatch",
            relatedEntityId: id,
          })),
        });
      }

      return { groupConversationId, activated: acceptedCount >= MIN_ACCEPTED_TO_ACTIVATE };
    });

    logAudit({
      actorUserId: userId,
      action: AuditActions.GROUP_MATCH_ACCEPTED,
      targetType: "GroupMatch",
      targetId: id,
      payload: { activated: updated.activated },
      ...requestMeta(request),
    });

    return apiSuccess({
      groupMatchId: id,
      myStatus: "ACCEPTED",
      groupConversationId: updated.groupConversationId,
      activated: updated.activated,
    });
  } catch (error) {
    console.error("Error responding to group match:", error);
    return apiError("INTERNAL_ERROR", "Failed to respond to group match", 500);
  }
});
