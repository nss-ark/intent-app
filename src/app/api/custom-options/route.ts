import { z } from "zod";
import { db } from "@/lib/db";
import { withAuth, apiSuccess, apiError, parseBody } from "@/lib/api-helpers";
import { getTenantId } from "@/lib/tenant";

// ── GET /api/custom-options?type=INTEREST|SPECIALIZATION|DOMAIN ────────

export const GET = withAuth(async (request, _context, session) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (!type || !["INTEREST", "SPECIALIZATION", "DOMAIN"].includes(type)) {
    return apiError("VALIDATION_ERROR", "type must be INTEREST, SPECIALIZATION, or DOMAIN", 422);
  }

  const tenantId = getTenantId(session);

  const options = await db.customOption.findMany({
    where: { tenantId, type, isActive: true },
    orderBy: [{ usageCount: "desc" }, { label: "asc" }],
    select: { id: true, label: true, value: true, usageCount: true },
  });

  return apiSuccess(options);
});

// ── POST /api/custom-options ───────────────────────────────────────────

const createSchema = z.object({
  type: z.enum(["INTEREST", "SPECIALIZATION", "DOMAIN"]),
  label: z.string().min(1).max(50).trim(),
});

export const POST = withAuth(async (request, _context, session) => {
  const parsed = await parseBody(request, createSchema);
  if (parsed.error) return parsed.error;

  const { type, label } = parsed.data;
  const tenantId = getTenantId(session);
  const value = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  // Upsert: if the same value exists, increment usage count
  const option = await db.customOption.upsert({
    where: { tenantId_type_value: { tenantId, type, value } },
    create: {
      tenantId,
      type,
      label,
      value,
      createdById: session.user.id,
      usageCount: 1,
    },
    update: {
      usageCount: { increment: 1 },
      isActive: true,
    },
    select: { id: true, label: true, value: true, usageCount: true },
  });

  return apiSuccess(option, 201);
});
