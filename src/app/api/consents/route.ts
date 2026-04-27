import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth, parseBody } from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";
import { z } from "zod";

// GET: List user's active consents
export const GET = withAuth(async (_request, _context, session) => {
  try {
    const consents = await db.userConsent.findMany({
      where: { userId: session.user.id },
      include: { policyVersion: true },
      orderBy: { acceptedAt: "desc" },
    });
    return apiSuccess(consents);
  } catch (error) {
    console.error("Consents GET error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch consents", 500);
  }
});

const grantConsentSchema = z.object({
  consentType: z.enum([
    "TERMS_OF_SERVICE",
    "PRIVACY_POLICY",
    "PROFILE_VISIBILITY",
    "MARKETING",
    "THIRD_PARTY",
  ]),
  policyVersionId: z.string().optional(),
});

// POST: Record a new consent
export const POST = withAuth(async (request, _context, session) => {
  const { data, error } = await parseBody(request, grantConsentSchema);
  if (error) return error;

  try {
    const meta = requestMeta(request);

    const consent = await db.userConsent.create({
      data: {
        userId: session.user.id,
        consentType: data.consentType,
        policyVersionId: data.policyVersionId ?? null,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });

    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.CONSENT_GRANTED,
      targetType: "UserConsent",
      targetId: consent.id,
      payload: { consentType: data.consentType },
      ...meta,
    });

    return apiSuccess(consent, 201);
  } catch (error) {
    console.error("Consents POST error:", error);
    return apiError("INTERNAL_ERROR", "Failed to record consent", 500);
  }
});

const withdrawConsentSchema = z.object({
  consentType: z.string(),
});

// PATCH: Withdraw a consent
export const PATCH = withAuth(async (request, _context, session) => {
  const { data, error } = await parseBody(request, withdrawConsentSchema);
  if (error) return error;

  try {
    const consent = await db.userConsent.findFirst({
      where: {
        userId: session.user.id,
        consentType: data.consentType,
        withdrawnAt: null,
      },
      orderBy: { acceptedAt: "desc" },
    });

    if (!consent) {
      return apiError("NOT_FOUND", "No active consent found for this type", 404);
    }

    const updated = await db.userConsent.update({
      where: { id: consent.id },
      data: { withdrawnAt: new Date() },
    });

    const meta = requestMeta(request);
    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.CONSENT_WITHDRAWN,
      targetType: "UserConsent",
      targetId: consent.id,
      payload: { consentType: data.consentType },
      ...meta,
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Consents PATCH error:", error);
    return apiError("INTERNAL_ERROR", "Failed to withdraw consent", 500);
  }
});
