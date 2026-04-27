import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth } from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

// POST: Request account erasure (DPDPA tombstoning)
export const POST = withAuth(async (request, _context, session) => {
  try {
    const userId = session.user.id;
    const now = new Date();
    const meta = requestMeta(request);

    // Create a data subject request for audit trail
    await db.dataSubjectRequest.create({
      data: {
        userId,
        requestType: "ERASURE",
        status: "COMPLETED",
        submittedAt: now,
        completedAt: now,
        dueBy: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Tombstone the user: replace PII with placeholders
    await db.$transaction([
      // Redact user PII
      db.user.update({
        where: { id: userId },
        data: {
          fullName: "[Deleted User]",
          email: `deleted-${userId.slice(0, 8)}@deleted.intent`,
          phoneNumber: null,
          photoUrl: null,
          dateOfBirth: null,
          deletedAt: now,
        },
      }),

      // Redact profile PII
      db.userProfile.updateMany({
        where: { userId },
        data: {
          missionStatement: null,
          currentCity: null,
          currentCountry: null,
          isVisibleInDiscovery: false,
          acceptingNewConversations: false,
        },
      }),

      // Redact message bodies sent by this user
      db.message.updateMany({
        where: { senderUserId: userId },
        data: { body: "[Message deleted]", deletedAt: now },
      }),

      // Remove LinkedIn links
      db.linkedinLink.deleteMany({ where: { userId } }),

      // Mark all nudges from this user as expired
      db.nudge.updateMany({
        where: { senderUserId: userId, status: "SENT" },
        data: { status: "EXPIRED" },
      }),
    ]);

    logAudit({
      actorUserId: userId,
      action: AuditActions.DATA_ERASURE_REQUESTED,
      targetType: "User",
      targetId: userId,
      payload: { tombstoned: true },
      ...meta,
    });

    return apiSuccess({ deleted: true, message: "Account data has been anonymized." });
  } catch (error) {
    console.error("Account deletion error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete account", 500);
  }
});
