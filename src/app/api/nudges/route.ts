import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
  parseBody,
} from "@/lib/api-helpers";
import { withTenantAndActive } from "@/lib/tenant";
import { sendEmailAsync, nudgeNotificationEmail } from "@/lib/email";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

// ── Helpers ──────────────────────────────────────────────────────────

/** Return the Monday 00:00:00 UTC of the week containing `date`. */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? 6 : day - 1; // distance from Monday
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

const userSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
  profile: { select: { missionStatement: true } },
} as const;

// ── GET /api/nudges ──────────────────────────────────────────────────

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") ?? "received";
    const status = searchParams.get("status");
    const { page, pageSize, skip } = parsePagination(searchParams);

    const where: Record<string, unknown> = {};

    if (tab === "sent") {
      where.senderUserId = session.user.id;
    } else {
      where.receiverUserId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    const [nudges, total] = await Promise.all([
      db.nudge.findMany({
        where,
        include: {
          sender: { select: userSelect },
          receiver: { select: userSelect },
          signals: {
            include: {
              tenantSignal: { include: { template: true } },
            },
          },
        },
        orderBy: { sentAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.nudge.count({ where }),
    ]);

    const items = nudges.map((nudge) => ({
      ...nudge,
      signals: nudge.signals.map((ns) => ({
        ...ns,
        displayName:
          ns.tenantSignal?.displayName ??
          ns.tenantSignal?.template?.displayNameDefault ??
          "Signal",
        signalType: ns.tenantSignal?.template?.signalType ?? "ASK",
        icon: ns.tenantSignal?.template?.icon ?? null,
      })),
    }));

    return apiSuccess({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error listing nudges:", error);
    return apiError("INTERNAL_ERROR", "Failed to list nudges", 500);
  }
});

// ── POST /api/nudges ─────────────────────────────────────────────────

const sendNudgeSchema = z.object({
  receiverUserId: z.string().min(1),
  message: z.string().max(400).optional(),
  signalIds: z.array(z.string().min(1)).min(1),
});

export const POST = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, sendNudgeSchema);
    if (parsed.error) return parsed.error;
    const { receiverUserId, message, signalIds } = parsed.data;

    // Cannot nudge yourself
    if (receiverUserId === session.user.id) {
      return apiError("VALIDATION_ERROR", "You cannot nudge yourself", 422);
    }

    // Receiver must exist, same tenant, not deleted
    const receiver = await db.user.findFirst({
      where: {
        id: receiverUserId,
        ...withTenantAndActive(session),
      },
    });
    if (!receiver) {
      return apiError("NOT_FOUND", "Receiver not found", 404);
    }

    // Check weekly quota
    const weekStart = getWeekStart(new Date());
    const quota = await db.nudgeQuota.findUnique({
      where: {
        userId_weekStartDate: {
          userId: session.user.id,
          weekStartDate: weekStart,
        },
      },
    });
    const weeklyLimit = quota?.weeklyLimit ?? 5;
    const sentCount = quota?.nudgesSentCount ?? 0;
    if (sentCount >= weeklyLimit) {
      return apiError(
        "QUOTA_EXCEEDED",
        "You have reached your weekly nudge limit",
        429
      );
    }

    // Check cooldown on this relationship
    const relationship = await db.nudgeRelationship.findUnique({
      where: {
        senderUserId_receiverUserId: {
          senderUserId: session.user.id,
          receiverUserId,
        },
      },
    });
    if (relationship?.cooldownUntil && relationship.cooldownUntil > new Date()) {
      return apiError(
        "COOLDOWN_ACTIVE",
        "You must wait before nudging this person again",
        429
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Create nudge + signals + upsert relationship + upsert quota in a transaction
    const nudge = await db.$transaction(async (tx) => {
      const created = await tx.nudge.create({
        data: {
          senderUserId: session.user.id,
          receiverUserId,
          message: message ?? null,
          status: "SENT",
          sentAt: now,
          expiresAt,
          signals: {
            create: signalIds.map((tenantSignalId) => ({
              tenantSignalId,
            })),
          },
        },
        include: {
          sender: { select: userSelect },
          receiver: { select: userSelect },
          signals: {
            include: {
              tenantSignal: { include: { template: true } },
            },
          },
        },
      });

      // Upsert NudgeRelationship
      await tx.nudgeRelationship.upsert({
        where: {
          senderUserId_receiverUserId: {
            senderUserId: session.user.id,
            receiverUserId,
          },
        },
        create: {
          senderUserId: session.user.id,
          receiverUserId,
          lastNudgedAt: now,
          countLifetime: 1,
        },
        update: {
          lastNudgedAt: now,
          countLifetime: { increment: 1 },
        },
      });

      // Upsert NudgeQuota for current week
      await tx.nudgeQuota.upsert({
        where: {
          userId_weekStartDate: {
            userId: session.user.id,
            weekStartDate: weekStart,
          },
        },
        create: {
          userId: session.user.id,
          weekStartDate: weekStart,
          nudgesSentCount: 1,
          weeklyLimit: 5,
        },
        update: {
          nudgesSentCount: { increment: 1 },
        },
      });

      return created;
    });

    // Fire-and-forget audit
    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.NUDGE_SENT,
      targetType: "Nudge",
      targetId: nudge.id,
      payload: { receiverUserId, signalIds },
      ...requestMeta(request),
    });

    // Send nudge notification email (fire-and-forget)
    sendEmailAsync({
      to: receiver.email,
      ...nudgeNotificationEmail(
        receiver.fullName,
        session.user.name,
        "a connection",
        (message ?? "").slice(0, 200)
      ),
    });

    return apiSuccess(nudge, 201);
  } catch (error) {
    console.error("Error sending nudge:", error);
    return apiError("INTERNAL_ERROR", "Failed to send nudge", 500);
  }
});
