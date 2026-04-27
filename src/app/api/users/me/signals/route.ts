import { z } from "zod";
import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth, parseBody } from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

// GET: List all tenant signals (with template codes) for the user's tenant
export const GET = withAuth(async (_request, _context, session) => {
  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    });

    if (!user) {
      return apiError("NOT_FOUND", "User not found", 404);
    }

    const tenantSignals = await db.tenantSignal.findMany({
      where: { isActive: true },
      include: { template: true },
    });

    return apiSuccess(
      tenantSignals.map((ts) => ({
        id: ts.id,
        code: ts.template.code,
        displayName: ts.displayName ?? ts.template.displayNameDefault,
        signalType: ts.template.signalType,
        icon: ts.template.icon,
      }))
    );
  } catch (error) {
    console.error("Signals GET error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch signals", 500);
  }
});

const signalsUpdateSchema = z.object({
  signals: z.array(
    z.object({
      tenantSignalId: z.string().min(1, "Signal ID is required"),
      isOpen: z.boolean(),
    })
  ),
});

export const PUT = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, signalsUpdateSchema);
    if (parsed.error) return parsed.error;

    const { signals } = parsed.data;

    await db.$transaction(async (tx) => {
      // Delete all existing open signals for this user
      await tx.userOpenSignal.deleteMany({
        where: { userId: session.user.id },
      });

      // Create new signal records (only those marked as open)
      const toCreate = signals.filter((s) => s.isOpen);
      if (toCreate.length > 0) {
        await tx.userOpenSignal.createMany({
          data: toCreate.map((s) => ({
            userId: session.user.id,
            tenantSignalId: s.tenantSignalId,
            isOpen: true,
          })),
        });
      }
    });

    // Audit log (fire-and-forget)
    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.SIGNALS_UPDATED,
      targetType: "UserOpenSignal",
      targetId: session.user.id,
      payload: { signalCount: signals.filter((s) => s.isOpen).length },
      ...requestMeta(request),
    });

    return apiSuccess({ updated: true });
  } catch (error) {
    console.error("Signals PUT error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update signals", 500);
  }
});
