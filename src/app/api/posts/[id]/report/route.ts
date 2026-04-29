import { z } from "zod";
import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth, parseBody } from "@/lib/api-helpers";

// ── POST /api/posts/[id]/report ─────────────────────────────────────

const reportPostSchema = z.object({
  reason: z.enum(["SPAM", "HARASSMENT", "INAPPROPRIATE", "MISINFORMATION", "OTHER"]),
  description: z.string().max(1000).optional(),
});

export const POST = withAuth(async (request, context, session) => {
  try {
    const { id: postId } = await context.params;

    // Verify post exists and is active
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true },
    });

    if (!post || post.status !== "ACTIVE") {
      return apiError("NOT_FOUND", "Post not found", 404);
    }

    // Prevent duplicate reports from the same user
    const existingReport = await db.postReport.findFirst({
      where: {
        reporterId: session.user.id,
        postId,
      },
    });

    if (existingReport) {
      return apiError(
        "DUPLICATE_REPORT",
        "You have already reported this post",
        409
      );
    }

    const parsed = await parseBody(request, reportPostSchema);
    if (parsed.error) return parsed.error;
    const { reason, description } = parsed.data;

    const report = await db.postReport.create({
      data: {
        reporterId: session.user.id,
        postId,
        reason,
        description: description ?? null,
        status: "PENDING",
      },
    });

    return apiSuccess(report, 201);
  } catch (error) {
    console.error("Error reporting post:", error);
    return apiError("INTERNAL_ERROR", "Failed to report post", 500);
  }
});
