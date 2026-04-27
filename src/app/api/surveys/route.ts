import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  type AuthSession,
} from "@/lib/api-helpers";

export const GET = withAuth(
  async (_request: NextRequest, _context, session: AuthSession) => {
    try {
      const now = new Date();

      const surveys = await db.survey.findMany({
        where: {
          status: "PUBLISHED",
          OR: [{ closesAt: null }, { closesAt: { gt: now } }],
        },
        include: {
          _count: { select: { questions: true } },
          responses: {
            where: { userId: session.user.id },
            select: { id: true },
          },
        },
        orderBy: { publishedAt: "desc" },
      });

      const data = surveys.map((survey) => {
        const { responses, ...rest } = survey;
        return {
          ...rest,
          hasResponded: responses.length > 0,
        };
      });

      return apiSuccess(data);
    } catch (error) {
      console.error("Error listing surveys:", error);
      return apiError("INTERNAL_ERROR", "Failed to list surveys", 500);
    }
  }
);
