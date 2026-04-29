import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth, parsePagination } from "@/lib/api-helpers";

const participantSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
  profile: { select: { missionStatement: true } },
} as const;

// ── GET /api/conversations ──────────────────────────────────────────

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams);
    const userId = session.user.id;

    const where = {
      OR: [{ userAId: userId }, { userBId: userId }],
    };

    const [conversations, total] = await Promise.all([
      db.conversation.findMany({
        where,
        include: {
          userA: { select: participantSelect },
          userB: { select: participantSelect },
          messages: {
            orderBy: { sentAt: "desc" as const },
            take: 1,
          },
        },
        orderBy: { lastMessageAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.conversation.count({ where }),
    ]);

    // Fetch unread counts for each conversation in parallel
    const enriched = await Promise.all(
      conversations.map(async (convo) => {
        const unreadCount = await db.message.count({
          where: {
            conversationId: convo.id,
            senderUserId: { not: userId },
            readAtByRecipient: null,
            deletedAt: null,
          },
        });

        const otherUser =
          convo.userAId === userId ? convo.userB : convo.userA;
        const lastMessage = convo.messages[0] ?? null;

        return {
          id: convo.id,
          createdAt: convo.createdAt,
          lastMessageAt: convo.lastMessageAt,
          matchId: convo.matchId ?? null,
          originatedFromNudgeId: convo.originatedFromNudgeId ?? null,
          otherUser,
          lastMessage,
          unreadCount,
        };
      })
    );

    return apiSuccess({
      items: enriched,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error listing conversations:", error);
    return apiError("INTERNAL_ERROR", "Failed to list conversations", 500);
  }
});
