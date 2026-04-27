import { db } from "@/lib/db";
import { apiError, withAuth } from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";
import { NextResponse } from "next/server";

// POST: Export all user data as JSON (DPDPA data subject access request)
export const POST = withAuth(async (request, _context, session) => {
  try {
    const userId = session.user.id;

    // Fetch all user data in parallel
    const [
      user,
      profile,
      education,
      experience,
      niches,
      badges,
      signals,
      nudgesSent,
      nudgesReceived,
      conversations,
      surveyResponses,
      gamification,
      consents,
      auditLogs,
    ] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, fullName: true, phoneNumber: true,
          institutionMemberStatus: true, graduationYear: true, program: true,
          createdAt: true, updatedAt: true, lastActiveAt: true,
        },
      }),
      db.userProfile.findUnique({ where: { userId } }),
      db.userEducation.findMany({ where: { userId } }),
      db.userExperience.findMany({ where: { userId }, include: { company: true } }),
      db.userNiche.findMany({ where: { userId }, include: { niche: true } }),
      db.userBadge.findMany({ where: { userId }, include: { tenantBadge: { include: { template: true } } } }),
      db.userOpenSignal.findMany({ where: { userId }, include: { tenantSignal: { include: { template: true } } } }),
      db.nudge.findMany({ where: { senderUserId: userId }, include: { signals: true } }),
      db.nudge.findMany({ where: { receiverUserId: userId }, include: { signals: true } }),
      db.conversation.findMany({
        where: { OR: [{ userAId: userId }, { userBId: userId }] },
        include: { messages: { where: { senderUserId: userId } } },
      }),
      db.surveyResponse.findMany({ where: { userId }, include: { answers: true } }),
      db.userGamificationState.findUnique({ where: { userId } }),
      db.userConsent.findMany({ where: { userId } }),
      db.auditLog.findMany({
        where: { actorUserId: userId },
        orderBy: { occurredAt: "desc" },
        take: 500,
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      profile,
      education,
      experience,
      niches,
      badges,
      signals,
      nudges: { sent: nudgesSent, received: nudgesReceived },
      conversations,
      surveyResponses,
      gamification,
      consents,
      auditLogs,
    };

    const meta = requestMeta(request);
    logAudit({
      actorUserId: userId,
      action: AuditActions.DATA_EXPORT_REQUESTED,
      targetType: "User",
      targetId: userId,
      ...meta,
    });

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="intent-data-export-${userId.slice(0, 8)}.json"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return apiError("INTERNAL_ERROR", "Failed to export data", 500);
  }
});
