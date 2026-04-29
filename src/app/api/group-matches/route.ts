import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
} from "@/lib/api-helpers";

// ── Shared selects ──────────────────────────────────────────────────

const memberUserSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
} as const;

// ── GET /api/group-matches ──────────────────────────────────────────

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams);
    const userId = session.user.id;

    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      members: { some: { userId } },
    };

    if (status) {
      const statuses = status.split(",").map((s) => s.trim());
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }

    const [groupMatches, total] = await Promise.all([
      db.groupMatch.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.groupMatch.count({ where }),
    ]);

    const items = groupMatches.map((gm) => {
      const myMembership = gm.members.find((m) => m.userId === userId);
      return {
        id: gm.id,
        status: gm.status,
        matchScore: gm.matchScore,
        matchReason: gm.matchReason,
        groupSize: gm.groupSize,
        createdAt: gm.createdAt,
        activatedAt: gm.activatedAt,
        myStatus: myMembership?.status ?? null,
        members: gm.members.map((m) => ({
          userId: m.userId,
          status: m.status,
          fitScore: m.fitScore,
          user: m.user,
        })),
        niches: gm.niches.map((n) => n.niche),
        groupConversationId: gm.groupConversation?.id ?? null,
      };
    });

    return apiSuccess({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error listing group matches:", error);
    return apiError("INTERNAL_ERROR", "Failed to list group matches", 500);
  }
});
