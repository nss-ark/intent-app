import { z } from "zod";
import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth, parseBody } from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

const profileUpdateSchema = z.object({
  missionStatement: z.string().max(200, "Mission statement must be 200 characters or less").optional(),
  currentCity: z.string().optional(),
  currentCountry: z.string().optional(),
  isVisibleInDiscovery: z.boolean().optional(),
  acceptingNewConversations: z.boolean().optional(),
  weeklyInboxLimit: z.number().int().min(0).max(50).optional(),
  fullName: z.string().min(1, "Name is required").optional(),
  photoUrl: z.string().url("Invalid photo URL").nullable().optional(),
});

export const PATCH = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, profileUpdateSchema);
    if (parsed.error) return parsed.error;

    const {
      missionStatement,
      currentCity,
      currentCountry,
      isVisibleInDiscovery,
      acceptingNewConversations,
      weeklyInboxLimit,
      fullName,
      photoUrl,
    } = parsed.data;

    // Build update payloads
    const userUpdate: Record<string, unknown> = {};
    if (fullName !== undefined) userUpdate.fullName = fullName;
    if (photoUrl !== undefined) userUpdate.photoUrl = photoUrl;

    const profileUpdate: Record<string, unknown> = {};
    if (missionStatement !== undefined) profileUpdate.missionStatement = missionStatement;
    if (currentCity !== undefined) profileUpdate.currentCity = currentCity;
    if (currentCountry !== undefined) profileUpdate.currentCountry = currentCountry;
    if (isVisibleInDiscovery !== undefined) profileUpdate.isVisibleInDiscovery = isVisibleInDiscovery;
    if (acceptingNewConversations !== undefined) profileUpdate.acceptingNewConversations = acceptingNewConversations;
    if (weeklyInboxLimit !== undefined) profileUpdate.weeklyInboxLimit = weeklyInboxLimit;

    const result = await db.$transaction(async (tx) => {
      // Update User fields if any
      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: session.user.id },
          data: userUpdate,
        });
      }

      // Update or create UserProfile
      const hasProfileUpdates = Object.keys(profileUpdate).length > 0;
      let profile;

      if (hasProfileUpdates) {
        // Track city change timestamp
        if (currentCity !== undefined) {
          profileUpdate.cityChangedAt = new Date();
        }

        profile = await tx.userProfile.upsert({
          where: { userId: session.user.id },
          update: profileUpdate,
          create: {
            userId: session.user.id,
            ...profileUpdate,
          },
          include: {
            domain: true,
          },
        });
      } else {
        profile = await tx.userProfile.findUnique({
          where: { userId: session.user.id },
          include: { domain: true },
        });
      }

      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          fullName: true,
          photoUrl: true,
          email: true,
        },
      });

      return { user, profile };
    });

    // Audit log (fire-and-forget)
    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.PROFILE_UPDATED,
      targetType: "UserProfile",
      targetId: session.user.id,
      payload: parsed.data as Record<string, unknown>,
      ...requestMeta(request),
    });

    return apiSuccess({
      user: result.user,
      profile: result.profile,
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return apiError("INTERNAL_ERROR", "Failed to update profile", 500);
  }
});
