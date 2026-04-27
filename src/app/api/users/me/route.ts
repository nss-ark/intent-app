import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth } from "@/lib/api-helpers";

export const GET = withAuth(async (_request, _context, session) => {
  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
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
          orderBy: { isCurrent: "desc" },
        },
        badges: {
          include: {
            tenantBadge: {
              include: {
                template: true,
              },
            },
          },
          where: { isVisible: true },
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
        gamificationState: true,
        linkedinLinks: true,
        tenant: true,
      },
    });

    if (!user) {
      return apiError("NOT_FOUND", "User not found", 404);
    }

    const { hashedPassword: _, ...safeUser } = user;
    return apiSuccess(safeUser);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch profile", 500);
  }
});
