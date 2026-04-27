import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth } from "@/lib/api-helpers";

export const GET = withAuth(async (_request, _context, _session) => {
  try {
    const [domains, niches, cityRows, yearRows] = await Promise.all([
      db.domain.findMany({
        where: { isActive: true },
        select: { id: true, code: true, displayName: true },
        orderBy: { position: "asc" },
      }),
      db.niche.findMany({
        where: { isActive: true },
        select: { id: true, code: true, displayName: true },
        orderBy: { position: "asc" },
      }),
      db.userProfile.findMany({
        where: {
          currentCity: { not: null },
        },
        select: { currentCity: true },
        distinct: ["currentCity"],
        orderBy: { currentCity: "asc" },
      }),
      db.user.findMany({
        where: {
          graduationYear: { not: null },
          deletedAt: null,
        },
        select: { graduationYear: true },
        distinct: ["graduationYear"],
        orderBy: { graduationYear: "desc" },
      }),
    ]);

    const cities = cityRows
      .map((r) => r.currentCity)
      .filter((c): c is string => c !== null);

    const classYears = yearRows
      .map((r) => r.graduationYear)
      .filter((y): y is number => y !== null);

    return apiSuccess({ domains, niches, cities, classYears });
  } catch (error) {
    console.error("Discovery filters GET error:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch filters", 500);
  }
});
