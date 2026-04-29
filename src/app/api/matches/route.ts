import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
} from "@/lib/api-helpers";

// ── Shared selects ──────────────────────────────────────────────────

const otherUserSelect = {
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

// ── Helpers ─────────────────────────────────────────────────────────

const TAB_STATUS_MAP: Record<string, string[]> = {
  active: ["PENDING", "NOTIFIED", "ACTIVE"],
  history: ["COMPLETED", "CANCELLED"],
};

// ── GET /api/matches ────────────────────────────────────────────────

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams);
    const userId = session.user.id;

    const status = searchParams.get("status");
    const tab = searchParams.get("tab");

    const where: Record<string, unknown> = {
      OR: [{ userAId: userId }, { userBId: userId }],
    };

    if (status) {
      where.status = status;
    } else if (tab && TAB_STATUS_MAP[tab]) {
      where.status = { in: TAB_STATUS_MAP[tab] };
    }

    const [matches, total] = await Promise.all([
      db.match.findMany({
        where,
        include: {
          userA: { select: otherUserSelect },
          userB: { select: otherUserSelect },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.match.count({ where }),
    ]);

    const items = matches.map((match) => {
      const otherUser =
        match.userAId === userId ? match.userB : match.userA;
      const myStatus =
        match.userAId === userId ? match.userAStatus : match.userBStatus;

      return {
        id: match.id,
        matchType: match.matchType,
        status: match.status,
        myStatus,
        userAStatus: match.userAStatus,
        userBStatus: match.userBStatus,
        matchScore: match.matchScore,
        matchReason: match.matchReason,
        notifiedAt: match.notifiedAt,
        acceptedAt: match.acceptedAt,
        createdAt: match.createdAt,
        otherUser,
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
    console.error("Error listing matches:", error);
    return apiError("INTERNAL_ERROR", "Failed to list matches", 500);
  }
});
