import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  type AuthSession,
} from "@/lib/api-helpers";

export const GET = withAuth(
  async (_request: NextRequest, context, session: AuthSession) => {
    try {
      const { id } = await context.params as { id: string };

      const survey = await db.survey.findUnique({
        where: { id },
        include: {
          questions: {
            orderBy: { position: "asc" },
            include: {
              options: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      });

      if (!survey) {
        return apiError("NOT_FOUND", "Survey not found", 404);
      }

      // Fetch user's existing response if any
      const userResponse = await db.surveyResponse.findUnique({
        where: {
          surveyId_userId: {
            surveyId: id,
            userId: session.user.id,
          },
        },
        include: {
          answers: true,
        },
      });

      return apiSuccess({
        ...survey,
        userResponse: userResponse ?? null,
      });
    } catch (error) {
      console.error("Error fetching survey detail:", error);
      return apiError("INTERNAL_ERROR", "Failed to fetch survey", 500);
    }
  }
);
