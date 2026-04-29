import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAdminAuth,
  parseBody,
} from "@/lib/api-helpers";
import { getTenantId } from "@/lib/tenant";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

// ── GET /api/matching-config ────────────────────────────────────────

export const GET = withAdminAuth(async (_request, _context, session) => {
  try {
    const tenantId = getTenantId(session);

    const configs = await db.matchingConfig.findMany({
      where: { tenantId },
      orderBy: { matchType: "asc" },
    });

    return apiSuccess(configs);
  } catch (error) {
    console.error("Error fetching matching config:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch matching config", 500);
  }
});

// ── PATCH /api/matching-config ──────────────────────────────────────

const updateConfigSchema = z.object({
  matchType: z.enum(["ONE_TO_ONE", "GROUP", "MENTORSHIP"]),
  isEnabled: z.boolean().optional(),
  frequency: z.enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
  minMatchScore: z.number().min(0).max(1).optional(),
  groupSizeMin: z.number().int().min(2).optional(),
  groupSizeMax: z.number().int().min(2).optional(),
  acceptanceWindowHours: z.number().int().min(1).optional(),
  matchesPerUserPerRun: z.number().int().min(1).optional(),
});

export const PATCH = withAdminAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, updateConfigSchema);
    if (parsed.error) return parsed.error;
    const { matchType, ...updates } = parsed.data;

    const tenantId = getTenantId(session);

    const config = await db.matchingConfig.upsert({
      where: {
        tenantId_matchType: { tenantId, matchType },
      },
      create: {
        tenantId,
        matchType,
        ...updates,
      },
      update: updates,
    });

    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.MATCHING_CONFIG_UPDATED,
      targetType: "MatchingConfig",
      targetId: config.id,
      payload: { matchType, ...updates },
      ...requestMeta(request),
    });

    return apiSuccess(config);
  } catch (error) {
    console.error("Error updating matching config:", error);
    return apiError("INTERNAL_ERROR", "Failed to update matching config", 500);
  }
}, ["OWNER", "OPERATOR"]);
