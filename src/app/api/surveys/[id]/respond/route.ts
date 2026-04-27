import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  parseBody,
  withAuth,
  type AuthSession,
} from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

const respondSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        optionId: z.string(),
      })
    )
    .min(1, "At least one answer is required"),
});

export const POST = withAuth(
  async (request: NextRequest, context, session: AuthSession) => {
    try {
      const { id: surveyId } = await context.params as { id: string };

      const parsed = await parseBody(request, respondSchema);
      if (parsed.error) return parsed.error;
      const { answers } = parsed.data;

      // Verify survey exists and is published
      const survey = await db.survey.findUnique({
        where: { id: surveyId },
        include: {
          questions: {
            where: { isRequired: true },
            select: { id: true },
          },
        },
      });

      if (!survey) {
        return apiError("NOT_FOUND", "Survey not found", 404);
      }

      if (survey.status !== "PUBLISHED") {
        return apiError("BAD_REQUEST", "Survey is not accepting responses", 400);
      }

      if (survey.closesAt && new Date(survey.closesAt) < new Date()) {
        return apiError("BAD_REQUEST", "Survey has closed", 400);
      }

      // Verify user hasn't already responded
      const existingResponse = await db.surveyResponse.findUnique({
        where: {
          surveyId_userId: {
            surveyId,
            userId: session.user.id,
          },
        },
      });

      if (existingResponse) {
        return apiError("CONFLICT", "You have already responded to this survey", 409);
      }

      // Verify all required questions are answered
      const requiredQuestionIds = new Set(survey.questions.map((q) => q.id));
      const answeredQuestionIds = new Set(answers.map((a) => a.questionId));

      for (const reqId of requiredQuestionIds) {
        if (!answeredQuestionIds.has(reqId)) {
          return apiError(
            "VALIDATION_ERROR",
            `Required question ${reqId} is not answered`,
            422
          );
        }
      }

      // Create response and answers in a transaction
      const response = await db.$transaction(async (tx) => {
        const surveyResponse = await tx.surveyResponse.create({
          data: {
            surveyId,
            userId: session.user.id,
          },
        });

        await tx.surveyResponseAnswer.createMany({
          data: answers.map((a) => ({
            responseId: surveyResponse.id,
            questionId: a.questionId,
            optionId: a.optionId,
          })),
        });

        return surveyResponse;
      });

      logAudit({
        actorUserId: session.user.id,
        action: AuditActions.SURVEY_RESPONSE_SUBMITTED,
        targetType: "SurveyResponse",
        targetId: response.id,
        payload: { surveyId },
        ...requestMeta(request),
      });

      return apiSuccess({ responseId: response.id }, 201);
    } catch (error) {
      console.error("Error submitting survey response:", error);
      return apiError("INTERNAL_ERROR", "Failed to submit survey response", 500);
    }
  }
);
