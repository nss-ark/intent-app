import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
  parseBody,
} from "@/lib/api-helpers";

// ── GET /api/notifications ──────────────────────────────────────────

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.readAt = null;
    }

    const [items, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.notification.count({ where }),
    ]);

    return apiSuccess({ items, total, page, pageSize });
  } catch (err) {
    console.error("[GET /api/notifications]", err);
    return apiError("INTERNAL_ERROR", "Failed to fetch notifications", 500);
  }
});

// ── PUT /api/notifications (mark all as read) ─────────────────────

export const PUT = withAuth(async (_request, _context, session) => {
  try {
    const result = await db.notification.updateMany({
      where: {
        userId: session.user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return apiSuccess({ markedCount: result.count });
  } catch (err) {
    console.error("[PUT /api/notifications]", err);
    return apiError("INTERNAL_ERROR", "Failed to mark all as read", 500);
  }
});

// ── PATCH /api/notifications ────────────────────────────────────────

const patchSchema = z.object({
  notificationId: z.string().uuid(),
});

export const PATCH = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, patchSchema);
    if (parsed.error) return parsed.error;

    const { notificationId } = parsed.data;

    // Verify the notification belongs to the current user
    const notification = await db.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return apiError("NOT_FOUND", "Notification not found", 404);
    }

    const updated = await db.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });

    return apiSuccess(updated);
  } catch (err) {
    console.error("[PATCH /api/notifications]", err);
    return apiError("INTERNAL_ERROR", "Failed to update notification", 500);
  }
});
