import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth } from "@/lib/api-helpers";

// ── Shared select for author info ───────────────────────────────────

const authorSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
} as const;

// ── GET /api/posts/[id] ─────────────────────────────────────────────

export const GET = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params;

    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: { select: authorSelect },
        _count: {
          select: {
            replies: { where: { status: "ACTIVE" } },
          },
        },
      },
    });

    if (!post || post.status !== "ACTIVE") {
      return apiError("NOT_FOUND", "Post not found", 404);
    }

    // Campus feed visibility check
    if (post.feedType === "CAMPUS") {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { userType: true },
      });
      if (user?.userType !== "STUDENT") {
        return apiError(
          "FORBIDDEN",
          "Campus feed is only available to students",
          403
        );
      }
    }

    return apiSuccess(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return apiError("INTERNAL_ERROR", "Failed to fetch post", 500);
  }
});

// ── DELETE /api/posts/[id] ──────────────────────────────────────────

export const DELETE = withAuth(async (_request, context, session) => {
  try {
    const { id } = await context.params;

    const post = await db.post.findUnique({
      where: { id },
      select: { id: true, authorId: true, status: true },
    });

    if (!post || post.status !== "ACTIVE") {
      return apiError("NOT_FOUND", "Post not found", 404);
    }

    if (post.authorId !== session.user.id) {
      return apiError("FORBIDDEN", "You can only delete your own posts", 403);
    }

    const updated = await db.post.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        archivedAt: new Date(),
      },
    });

    return apiSuccess({ id: updated.id, status: updated.status });
  } catch (error) {
    console.error("Error deleting post:", error);
    return apiError("INTERNAL_ERROR", "Failed to delete post", 500);
  }
});
