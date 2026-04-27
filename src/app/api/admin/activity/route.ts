import { db } from "@/lib/db";
import { apiSuccess, apiError, withAdminAuth } from "@/lib/api-helpers";

/** Human-readable labels for audit actions */
const actionLabels: Record<string, string> = {
  USER_SIGNUP: "signed up",
  USER_LOGIN: "logged in",
  PROFILE_UPDATED: "updated their profile",
  SIGNALS_UPDATED: "updated their signals",
  EXPERIENCE_ADDED: "added work experience",
  NUDGE_SENT: "sent a nudge",
  NUDGE_ACCEPTED: "accepted a nudge",
  NUDGE_DECLINED: "declined a nudge",
  MESSAGE_SENT: "sent a message",
  SURVEY_RESPONSE_SUBMITTED: "completed a survey",
  CONSENT_GRANTED: "granted consent",
  CONSENT_WITHDRAWN: "withdrew consent",
  DATA_EXPORT_REQUESTED: "requested a data export",
  DATA_ERASURE_REQUESTED: "requested account deletion",
  ADMIN_VERIFICATION_REVIEWED: "reviewed a verification",
  ADMIN_MEMBER_IMPORTED: "imported members",
  ADMIN_SURVEY_CREATED: "created a survey",
  ADMIN_EVENT_CREATED: "created an event",
  ADMIN_BADGE_AWARDED: "awarded a badge",
};

export const GET = withAdminAuth(async () => {
  try {
    const logs = await db.auditLog.findMany({
      orderBy: { occurredAt: "desc" },
      take: 10,
      include: {
        actorUser: {
          select: { fullName: true },
        },
      },
    });

    const items = logs.map((log) => ({
      id: log.id,
      text: `${log.actorUser?.fullName ?? "System"} ${actionLabels[log.action] ?? log.action}`,
      time: log.occurredAt.toISOString(),
    }));

    return apiSuccess(items);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch activity", 500);
  }
});
