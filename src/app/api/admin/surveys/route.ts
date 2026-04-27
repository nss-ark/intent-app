import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  parseBody,
  withAdminAuth,
  type AuthSession,
} from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

const createSurveySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  theme: z.string().optional(),
  matchingStrategy: z.string().optional(),
  matchGroupSizeMin: z.number().int().min(2).optional(),
  matchGroupSizeMax: z.number().int().min(2).optional(),
  closesAt: z.string().datetime().optional(),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1, "Question text is required"),
        questionType: z.enum(["SINGLE_SELECT", "MULTI_SELECT"]),
        isRequired: z.boolean().optional().default(true),
        options: z
          .array(
            z.object({
              optionText: z.string().min(1, "Option text is required"),
              optionValue: z.string().optional(),
            })
          )
          .min(1, "At least one option is required"),
      })
    )
    .min(1, "At least one question is required"),
});

export const POST = withAdminAuth(
  async (request: NextRequest, _context, session: AuthSession) => {
    try {
      const parsed = await parseBody(request, createSurveySchema);
      if (parsed.error) return parsed.error;
      const { questions, closesAt, ...surveyData } = parsed.data;

      // Find the admin user for this session
      const adminUser = await db.adminUser.findUnique({
        where: { userId: session.user.id },
      });

      if (!adminUser) {
        return apiError("FORBIDDEN", "Admin user record not found", 403);
      }

      const survey = await db.$transaction(async (tx) => {
        const created = await tx.survey.create({
          data: {
            title: surveyData.title,
            description: surveyData.description,
            theme: surveyData.theme,
            matchingStrategy: surveyData.matchingStrategy,
            matchGroupSizeMin: surveyData.matchGroupSizeMin ?? 2,
            matchGroupSizeMax: surveyData.matchGroupSizeMax ?? 4,
            closesAt: closesAt ? new Date(closesAt) : null,
            createdByAdminId: adminUser.id,
          },
        });

        for (let qi = 0; qi < questions.length; qi++) {
          const q = questions[qi];
          const question = await tx.surveyQuestion.create({
            data: {
              surveyId: created.id,
              position: qi + 1,
              questionText: q.questionText,
              questionType: q.questionType,
              isRequired: q.isRequired,
            },
          });

          if (q.options.length > 0) {
            await tx.surveyOption.createMany({
              data: q.options.map((opt, oi) => ({
                questionId: question.id,
                position: oi + 1,
                optionText: opt.optionText,
                optionValue: opt.optionValue ?? null,
              })),
            });
          }
        }

        // Re-fetch with full includes
        return tx.survey.findUnique({
          where: { id: created.id },
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
      });

      logAudit({
        actorAdminId: adminUser.id,
        action: AuditActions.ADMIN_SURVEY_CREATED,
        targetType: "Survey",
        targetId: survey!.id,
        payload: { title: surveyData.title },
        ...requestMeta(request),
      });

      return apiSuccess(survey, 201);
    } catch (error) {
      console.error("Error creating survey:", error);
      return apiError("INTERNAL_ERROR", "Failed to create survey", 500);
    }
  }
);
