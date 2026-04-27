import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth } from "@/lib/api-helpers";

/** Return the Monday 00:00:00 UTC of the week containing `date`. */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ── GET /api/nudges/quota ───────────────────────────────────────────

export const GET = withAuth(async (_request, _context, session) => {
  try {
    const weekStart = getWeekStart(new Date());

    const quota = await db.nudgeQuota.findUnique({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate: weekStart,
        },
      },
    });

    const sent = quota?.nudgesSentCount ?? 0;
    const limit = quota?.weeklyLimit ?? 5;

    return apiSuccess({
      sent,
      limit,
      remaining: Math.max(0, limit - sent),
      weekStartDate: weekStart.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching nudge quota:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch nudge quota", 500);
  }
});
