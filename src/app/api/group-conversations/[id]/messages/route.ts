import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
  parseBody,
} from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

// ── Shared selects ──────────────────────────────────────────────────

const senderSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
} as const;

// ── Helpers ─────────────────────────────────────────────────────────

async function verifyMembership(groupConversationId: string, userId: string) {
  const membership = await db.groupConversationMember.findUnique({
    where: {
      groupConversationId_userId: { groupConversationId, userId },
    },
  });
  return membership && !membership.leftAt;
}

// ── GET /api/group-conversations/[id]/messages ──────────────────────

export const GET = withAuth(async (request, context, session) => {
  try {
    const { id: groupConversationId } = await context.params;
    const userId = session.user.id;

    const isMember = await verifyMembership(groupConversationId, userId);
    if (!isMember) {
      return apiError(
        "FORBIDDEN",
        "Not authorised to view messages in this conversation",
        403
      );
    }

    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams);

    const where = {
      groupConversationId,
      deletedAt: null,
    };

    const [messages, total] = await Promise.all([
      db.groupMessage.findMany({
        where,
        include: {
          sender: { select: senderSelect },
        },
        orderBy: { sentAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.groupMessage.count({ where }),
    ]);

    return apiSuccess({
      items: messages,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error listing group messages:", error);
    return apiError("INTERNAL_ERROR", "Failed to list group messages", 500);
  }
});

// ── POST /api/group-conversations/[id]/messages ─────────────────────

const sendMessageSchema = z.object({
  body: z.string().min(1).max(2000),
});

export const POST = withAuth(async (request, context, session) => {
  try {
    const { id: groupConversationId } = await context.params;
    const userId = session.user.id;

    const isMember = await verifyMembership(groupConversationId, userId);
    if (!isMember) {
      return apiError(
        "FORBIDDEN",
        "Not authorised to send messages in this conversation",
        403
      );
    }

    const parsed = await parseBody(request, sendMessageSchema);
    if (parsed.error) return parsed.error;
    const { body } = parsed.data;

    const now = new Date();

    const message = await db.$transaction(async (tx) => {
      const created = await tx.groupMessage.create({
        data: {
          groupConversationId,
          senderUserId: userId,
          body,
          sentAt: now,
        },
        include: {
          sender: { select: senderSelect },
        },
      });

      await tx.groupConversation.update({
        where: { id: groupConversationId },
        data: { lastMessageAt: now },
      });

      return created;
    });

    logAudit({
      actorUserId: userId,
      action: AuditActions.GROUP_MESSAGE_SENT,
      targetType: "GroupMessage",
      targetId: message.id,
      payload: { groupConversationId },
      ...requestMeta(request),
    });

    return apiSuccess(message, 201);
  } catch (error) {
    console.error("Error sending group message:", error);
    return apiError("INTERNAL_ERROR", "Failed to send group message", 500);
  }
});
