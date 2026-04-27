import { db } from "@/lib/db";

/**
 * Check if a user has an active (non-withdrawn) consent of a given type.
 */
export async function hasActiveConsent(
  userId: string,
  consentType: string
): Promise<boolean> {
  const consent = await db.userConsent.findFirst({
    where: {
      userId,
      consentType,
      withdrawnAt: null,
    },
    orderBy: { acceptedAt: "desc" },
  });
  return consent !== null;
}

/**
 * Check multiple consent types at once.
 * Returns an object mapping each type to its status.
 */
export async function checkConsents(
  userId: string,
  consentTypes: string[]
): Promise<Record<string, boolean>> {
  const consents = await db.userConsent.findMany({
    where: {
      userId,
      consentType: { in: consentTypes },
      withdrawnAt: null,
    },
    orderBy: { acceptedAt: "desc" },
  });

  const result: Record<string, boolean> = {};
  for (const type of consentTypes) {
    result[type] = consents.some((c) => c.consentType === type);
  }
  return result;
}
