import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth, parsePagination } from "@/lib/api-helpers";
import { withTenantAndActive } from "@/lib/tenant";
import type { Prisma } from "@prisma/client";

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = parsePagination(searchParams);

    const search = searchParams.get("search")?.trim() || undefined;
    const hasAsks = searchParams.get("hasAsks") === "true";
    const hasOffers = searchParams.get("hasOffers") === "true";

    // Parse comma-separated multi-value filters
    const domainCodes = searchParams.get("domain")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
    const nicheCodes = searchParams.get("niche")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
    const cities = searchParams.get("city")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
    const classYears = searchParams.get("classYear")?.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n)) ?? [];

    // Build the where clause
    const where: Prisma.UserWhereInput = {
      ...withTenantAndActive(session),
      id: { not: session.user.id },
      profile: {
        isVisibleInDiscovery: true,
      },
    };

    // Search filter: fullName OR missionStatement OR currentCity
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { profile: { missionStatement: { contains: search } } },
        { profile: { currentCity: { contains: search } } },
      ];
    }

    // Domain filter (multi-select)
    if (domainCodes.length > 0) {
      where.profile = {
        ...(where.profile as Prisma.UserProfileWhereInput),
        domain: { code: domainCodes.length === 1 ? domainCodes[0] : { in: domainCodes } },
      };
    }

    // Niche filter (multi-select)
    if (nicheCodes.length > 0) {
      where.niches = {
        some: { niche: { code: nicheCodes.length === 1 ? nicheCodes[0] : { in: nicheCodes } } },
      };
    }

    // City filter (multi-select)
    if (cities.length > 0) {
      where.profile = {
        ...(where.profile as Prisma.UserProfileWhereInput),
        currentCity: cities.length === 1 ? cities[0] : { in: cities },
      };
    }

    // Class year filter (multi-select)
    if (classYears.length > 0) {
      where.graduationYear = classYears.length === 1 ? classYears[0] : { in: classYears };
    }

    // Has open asks/offers filters
    if (hasAsks) {
      where.openSignals = {
        ...where.openSignals as Prisma.UserOpenSignalListRelationFilter,
        some: { isOpen: true, tenantSignal: { template: { signalType: "ASK" } } },
      };
    }
    if (hasOffers) {
      where.openSignals = {
        ...where.openSignals as Prisma.UserOpenSignalListRelationFilter,
        some: { isOpen: true, tenantSignal: { template: { signalType: "OFFER" } } },
      };
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
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
          experience: {
            where: { isCurrent: true },
            include: {
              company: true,
            },
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
        skip,
        take: pageSize,
        orderBy: { fullName: "asc" },
      }),
      db.user.count({ where }),
    ]);

    // Map to UserCard-like shape
    const members = users.map((user) => {
      const currentExp = user.experience[0] ?? null;
      return {
        id: user.id,
        fullName: user.fullName,
        photoUrl: user.photoUrl,
        missionStatement: user.profile?.missionStatement ?? "",
        institutionMemberStatus: user.institutionMemberStatus,
        yearsOfExperience: user.profile?.yearsOfExperienceCached ?? null,
        currentCity: user.profile?.currentCity ?? null,
        currentCountry: user.profile?.currentCountry ?? null,
        domain: user.profile?.domain
          ? { id: user.profile.domain.id, displayName: user.profile.domain.displayName }
          : null,
        niches: user.niches.map((un) => ({
          id: un.niche.id,
          displayName: un.niche.displayName,
        })),
        currentCompany:
          currentExp?.company?.name ?? currentExp?.freeTextCompanyName ?? null,
        companyLogoUrl: currentExp?.company?.logoUrl ?? null,
        openSignals: user.openSignals.map((os) => ({
          id: os.tenantSignal?.id ?? os.tenantSignalId,
          displayName:
            os.tenantSignal?.displayName ??
            os.tenantSignal?.template?.displayNameDefault ??
            "Unknown Signal",
          signalType: os.tenantSignal?.template?.signalType ?? "ASK",
          icon: os.tenantSignal?.template?.icon ?? null,
        })),
        badges: user.badges.map((ub) => ({
          id: ub.id,
          tenantBadgeId: ub.tenantBadgeId,
          displayName:
            ub.tenantBadge?.displayName ??
            ub.tenantBadge?.template?.displayNameDefault ??
            "Badge",
          isVisible: ub.isVisible,
        })),
        graduationYear: user.graduationYear,
        isVerified: user.badges.some(
          (b) => b.tenantBadge?.template?.category === "IDENTITY"
        ),
      };
    });

    return apiSuccess({ members, total, page, pageSize });
  } catch (error) {
    console.error("Discovery GET error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch discovery feed", 500);
  }
});
