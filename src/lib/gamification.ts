import { db } from "@/lib/db";

interface PointsResult {
  pointsAwarded: number;
  newTotal: number;
  leveledUp: boolean;
  newLevel: number | null;
}

/**
 * Award gamification points for an event.
 * Looks up the rule, creates a ContributionEvent, updates the user's state,
 * and checks for level-up.
 *
 * Fire-and-forget safe — catches its own errors.
 */
export async function awardPoints(
  userId: string,
  eventType: string,
  relatedEntityType?: string,
  relatedEntityId?: string
): Promise<PointsResult | null> {
  try {
    // Look up the active rule for this event type
    const rule = await db.gamificationRule.findFirst({
      where: {
        eventType,
        isActive: true,
        OR: [
          { validFrom: null },
          { validFrom: { lte: new Date() } },
        ],
      },
    });

    if (!rule) return null;

    const points = rule.pointsValue;

    // Create the contribution event
    await db.contributionEvent.create({
      data: {
        userId,
        eventType,
        pointsAwarded: points,
        relatedEntityType: relatedEntityType ?? null,
        relatedEntityId: relatedEntityId ?? null,
      },
    });

    // Update user gamification state
    const state = await db.userGamificationState.upsert({
      where: { userId },
      create: {
        userId,
        totalPoints: points,
        currentLevel: 1,
      },
      update: {
        totalPoints: { increment: points },
        // Increment specific counters based on event type
        ...(eventType === "NUDGE_SENT" && { nudgesSentLifetime: { increment: 1 } }),
        ...(eventType === "NUDGE_ACCEPTED" && { nudgesAcceptedLifetime: { increment: 1 } }),
        ...(eventType === "NUDGE_RESPONDED" && { nudgesRespondedLifetime: { increment: 1 } }),
        ...(eventType === "SURVEY_COMPLETED" && { surveysCompletedCount: { increment: 1 } }),
        ...(eventType === "EVENT_ATTENDED" && { eventsAttendedCount: { increment: 1 } }),
        ...(eventType === "EVENT_HOSTED" && { eventsHostedCount: { increment: 1 } }),
        ...(eventType === "RESOURCE_SHARED" && { resourcesSharedCount: { increment: 1 } }),
        ...(eventType === "MENTORSHIP_SESSION_COMPLETED" && {
          mentorshipsAsMentorCount: { increment: 1 },
        }),
      },
    });

    // Check for level-up
    const nextLevel = await db.levelDefinition.findFirst({
      where: {
        pointsRequired: { lte: state.totalPoints },
        levelNumber: { gt: state.currentLevel },
      },
      orderBy: { levelNumber: "desc" },
    });

    let leveledUp = false;
    let newLevel: number | null = null;

    if (nextLevel) {
      await db.userGamificationState.update({
        where: { userId },
        data: {
          currentLevel: nextLevel.levelNumber,
          levelAchievedAt: new Date(),
        },
      });
      leveledUp = true;
      newLevel = nextLevel.levelNumber;
    }

    return {
      pointsAwarded: points,
      newTotal: state.totalPoints,
      leveledUp,
      newLevel,
    };
  } catch (error) {
    console.error("[gamification] Failed to award points:", error);
    return null;
  }
}
