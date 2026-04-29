import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
} from "@/lib/api-helpers";

// ── Shared selects ──────────────────────────────────────────────────

const userSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
  profile: {
    select: {
      missionStatement: true,
      domain: { select: { id: true, code: true, displayName: true } },
    },
  },
} as const;

// ── GET /api/mentorships ────────────────────────────────────────────

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams);
    const userId = session.user.id;

    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      OR: [{ mentorUserId: userId }, { menteeUserId: userId }],
    };

    if (status) {
      where.status = status;
    }

    const [mentorships, total] = await Promise.all([
      db.mentorship.findMany({
        where,
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
        orderBy: { startedAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.mentorship.count({ where }),
    ]);

    const items = mentorships.map((m) => ({
      ...m,
      myRole: m.mentorUserId === userId ? "MENTOR" : "MENTEE",
    }));

    return apiSuccess({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error listing mentorships:", error);
    return apiError("INTERNAL_ERROR", "Failed to list mentorships", 500);
  }
});
