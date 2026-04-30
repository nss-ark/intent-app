import { z } from "zod";
import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth, parseBody } from "@/lib/api-helpers";
import { logAudit, AuditActions, requestMeta } from "@/lib/audit";

const addExperienceSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  title: z.string().min(1, "Title is required"),
  isCurrent: z.boolean().optional(),
});

const deleteExperienceSchema = z.object({
  id: z.string().uuid("Invalid experience ID"),
});

export const POST = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, addExperienceSchema);
    if (parsed.error) return parsed.error;

    const { companyName, title, isCurrent } = parsed.data;

    const experience = await db.$transaction(async (tx) => {
      // If marking as current, clear isCurrent on all other experiences
      if (isCurrent) {
        await tx.userExperience.updateMany({
          where: { userId: session.user.id },
          data: { isCurrent: false },
        });
      }

      return tx.userExperience.create({
        data: {
          userId: session.user.id,
          freeTextCompanyName: companyName,
          title,
          isCurrent: isCurrent ?? false,
        },
      });
    });

    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.EXPERIENCE_ADDED,
      targetType: "UserExperience",
      targetId: experience.id,
      payload: { companyName, title, isCurrent: isCurrent ?? false },
      ...requestMeta(request),
    });

    return apiSuccess(experience, 201);
  } catch (error) {
    console.error("Experience POST error:", error);
    return apiError("INTERNAL_ERROR", "Failed to add experience", 500);
  }
});

export const DELETE = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, deleteExperienceSchema);
    if (parsed.error) return parsed.error;

    const { id } = parsed.data;

    // Verify the experience belongs to the authenticated user
    const experience = await db.userExperience.findUnique({
      where: { id },
    });

    if (!experience) {
      return apiError("NOT_FOUND", "Experience not found", 404);
    }

    if (experience.userId !== session.user.id) {
      return apiError("FORBIDDEN", "You can only delete your own experiences", 403);
    }

    await db.userExperience.delete({
      where: { id },
    });

    logAudit({
      actorUserId: session.user.id,
      action: AuditActions.EXPERIENCE_DELETED,
      targetType: "UserExperience",
      targetId: id,
      payload: { title: experience.title, companyName: experience.freeTextCompanyName },
      ...requestMeta(request),
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Experience DELETE error:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete experience", 500);
  }
});
