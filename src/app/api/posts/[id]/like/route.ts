import { db } from "@/lib/db";
import { apiSuccess, apiError, withAuth } from "@/lib/api-helpers";

// POST: Toggle like on a post (like if not liked, unlike if already liked)
export const POST = withAuth(async (_request, context, session) => {
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

    const userId = session.user.id;

    // Check if already liked
    const existing = await db.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      // Unlike
      await db.postLike.delete({
        where: { postId_userId: { postId, userId } },
      });
    } else {
      // Like
      await db.postLike.create({
        data: { postId, userId },
      });
    }

    // Return new count and state
    const likeCount = await db.postLike.count({ where: { postId } });

    return apiSuccess({
      liked: !existing,
      likeCount,
    });
  } catch (error) {
    console.error("Post like toggle error:", error);
    return apiError("INTERNAL_ERROR", "Failed to toggle like", 500);
  }
});
