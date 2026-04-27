import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth, parsePagination } from "@/lib/api-helpers";
import { withTenantAndActive } from "@/lib/tenant";
import type { Prisma } from "@prisma/client";

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = request.nextUrl;
    const { page, pageSize, skip } = parsePagination(searchParams);

    const search = searchParams.get("search")?.trim() || undefined;
    const domain = searchParams.get("domain")?.trim() || undefined;
    const niche = searchParams.get("niche")?.trim() || undefined;
    const city = searchParams.get("city")?.trim() || undefined;
    const classYear = searchParams.get("classYear")?.trim() || undefined;

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

    // Domain filter
    if (domain) {
      where.profile = {
        ...(where.profile as Prisma.UserProfileWhereInput),
        domain: { code: domain },
      };
    }

    // Niche filter
    if (niche) {
      where.niches = {
        some: { niche: { code: niche } },
      };
    }

    // City filter — pills send exact DB values; use equals for precise matching
    if (city) {
      where.profile = {
        ...(where.profile as Prisma.UserProfileWhereInput),
        currentCity: city,
      };
    }

    // Class year filter
    if (classYear) {
      const year = parseInt(classYear, 10);
      if (!isNaN(year)) {
        where.graduationYear = year;
      }
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
        })),
        graduationYear: user.graduationYear,
        isVerified: user.badges.some(
          (b) => b.tenantBadge.template.category === "IDENTITY"
        ),
      };
    });

    return apiSuccess({ members, total, page, pageSize });
  } catch (error) {
    console.error("Discovery GET error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch discovery feed", 500);
  }
});
