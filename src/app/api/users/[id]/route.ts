import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth } from "@/lib/api-helpers";

export const GET = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            domain: true,
          },
        },
        niches: {
          include: {
            niche: true,
          },
          orderBy: { position: "asc" },
        },
        education: true,
        experience: {
          include: {
            company: true,
          },
          orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
        },
        badges: {
          where: { isVisible: true },
          include: {
            tenantBadge: {
              include: {
                template: true,
              },
            },
          },
        },
        openSignals: {
          where: { isOpen: true },
          include: {
            tenantSignal: {
              include: {
                template: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt !== null) {
      return apiError("NOT_FOUND", "User not found", 404);
    }

    // Verify same tenant
    if (user.tenantId !== session.user.tenantId) {
      return apiError("FORBIDDEN", "Access denied", 403);
    }

    // Strip hashedPassword and map to a clean shape
    const currentExp = user.experience.find((e) => e.isCurrent) ?? null;

    const mapped = {
      id: user.id,
      fullName: user.fullName,
      photoUrl: user.photoUrl,
      email: user.email,
      phoneNumber: user.phoneNumber,
      institutionMemberStatus: user.institutionMemberStatus,
      graduationYear: user.graduationYear,
      program: user.program,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      profile: user.profile
        ? {
            id: user.profile.id,
            missionStatement: user.profile.missionStatement,
            currentCity: user.profile.currentCity,
            currentCountry: user.profile.currentCountry,
            yearsOfExperienceCached: user.profile.yearsOfExperienceCached,
            profileCompletenessScore: user.profile.profileCompletenessScore,
            isVisibleInDiscovery: user.profile.isVisibleInDiscovery,
            acceptingNewConversations: user.profile.acceptingNewConversations,
            weeklyInboxLimit: user.profile.weeklyInboxLimit,
          }
        : null,
      domain: user.profile?.domain
        ? {
            id: user.profile.domain.id,
            code: user.profile.domain.code,
            displayName: user.profile.domain.displayName,
          }
        : null,
      niches: user.niches.map((un) => ({
        id: un.niche.id,
        code: un.niche.code,
        displayName: un.niche.displayName,
        position: un.position,
      })),
      education: user.education.map((ed) => ({
        id: ed.id,
        programName: ed.programName,
        batchYear: ed.batchYear,
        specialization: ed.specialization,
        verified: ed.verified,
      })),
      experience: user.experience.map((exp) => ({
        id: exp.id,
        title: exp.title,
        companyName: exp.company?.name ?? exp.freeTextCompanyName,
        companyLogoUrl: exp.company?.logoUrl ?? null,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        verified: exp.verified,
      })),
      currentCompany:
        currentExp?.company?.name ?? currentExp?.freeTextCompanyName ?? null,
      companyLogoUrl: currentExp?.company?.logoUrl ?? null,
      openSignals: user.openSignals.map((os) => ({
        id: os.tenantSignal.id,
        displayName:
          os.tenantSignal.displayName ??
          os.tenantSignal.template.displayNameDefault,
        signalType: os.tenantSignal.template.signalType,
        icon: os.tenantSignal.template.icon,
      })),
      badges: user.badges.map((ub) => ({
        id: ub.id,
        tenantBadgeId: ub.tenantBadgeId,
        displayName:
          ub.tenantBadge.displayName ??
          ub.tenantBadge.template.displayNameDefault,
        isVisible: ub.isVisible,
        awardedAt: ub.awardedAt,
      })),
      isVerified: user.badges.some(
        (b) => b.tenantBadge.template.category === "IDENTITY"
      ),
    };

    return apiSuccess(mapped);
  } catch (error) {
    console.error("User GET error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch user", 500);
  }
});
