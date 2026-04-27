import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parseBody,
} from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

// ── POST /api/conversations/[id]/messages ───────────────────────────

const sendMessageSchema = z.object({
  body: z.string().min(1).max(2000),
});

export const POST = withAuth(async (request, context, session) => {
  try {
    const { id: conversationId } = await context.params;
    const userId = session.user.id;

    const parsed = await parseBody(request, sendMessageSchema);
    if (parsed.error) return parsed.error;
    const { body } = parsed.data;

    // Verify conversation exists and user is a participant
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return apiError("NOT_FOUND", "Conversation not found", 404);
    }

    if (
      conversation.userAId !== userId &&
      conversation.userBId !== userId
    ) {
      return apiError(
        "FORBIDDEN",
        "Not authorised to send messages in this conversation",
        403
      );
    }

    const now = new Date();

    // Create message and update conversation.lastMessageAt in a transaction
    const message = await db.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId,
          senderUserId: userId,
          body,
          sentAt: now,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: now },
      });

      return created;
    });

    logAudit({
      actorUserId: userId,
      action: AuditActions.MESSAGE_SENT,
      targetType: "Message",
      targetId: message.id,
      payload: { conversationId },
      ...requestMeta(request),
    });

    return apiSuccess(message, 201);
  } catch (error) {
    console.error("Error sending message:", error);
    return apiError("INTERNAL_ERROR", "Failed to send message", 500);
  }
});
