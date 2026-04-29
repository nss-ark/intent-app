import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
} from "@/lib/api-helpers";

const participantSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
  profile: { select: { missionStatement: true } },
} as const;

// ── GET /api/conversations/[id] ─────────────────────────────────────

export const GET = withAuth(async (request, context, session) => {
  try {
    const { id } = await context.params;
    const userId = session.user.id;

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        userA: { select: participantSelect },
        userB: { select: participantSelect },
      },
    });

    if (!conversation) {
      return apiError("NOT_FOUND", "Conversation not found", 404);
    }

    // Verify participant
    if (
      conversation.userAId !== userId &&
      conversation.userBId !== userId
    ) {
      return apiError(
        "FORBIDDEN",
        "Not authorised to view this conversation",
        403
      );
    }

    // Paginated messages
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams);

    const [messages, totalMessages] = await Promise.all([
      db.message.findMany({
        where: { conversationId: id, deletedAt: null },
        orderBy: { sentAt: "asc" },
        skip,
        take: pageSize,
      }),
      db.message.count({
        where: { conversationId: id, deletedAt: null },
      }),
    ]);

    // Mark unread messages from the other user as read
    await db.message.updateMany({
      where: {
        conversationId: id,
        senderUserId: { not: userId },
        readAtByRecipient: null,
        deletedAt: null,
      },
      data: { readAtByRecipient: new Date() },
    });

    const otherUser =
      conversation.userAId === userId
        ? conversation.userB
        : conversation.userA;

    return apiSuccess({
      id: conversation.id,
      userAId: conversation.userAId,
      userBId: conversation.userBId,
      createdAt: conversation.createdAt,
      lastMessageAt: conversation.lastMessageAt,
      matchId: conversation.matchId ?? null,
      originatedFromNudgeId: conversation.originatedFromNudgeId ?? null,
      otherUser,
      messages: {
        items: messages,
        page,
        pageSize,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch conversation", 500);
  }
});
