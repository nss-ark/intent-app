import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
  parseBody,
} from "@/lib/api-helpers";

// ── Shared select for author info ───────────────────────────────────

const authorSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
} as const;

// ── GET /api/posts/[id]/replies ─────────────────────────────────────

export const GET = withAuth(async (request, context, session) => {
  try {
    const { id: postId } = await context.params;
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams);

    // Verify post exists and is active
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true, feedType: true },
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

    const where = {
      postId,
      status: "ACTIVE",
    };

    const [replies, total] = await Promise.all([
      db.postReply.findMany({
        where,
        include: {
          author: { select: authorSelect },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: pageSize,
      }),
      db.postReply.count({ where }),
    ]);

    return apiSuccess({
      items: replies,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error listing replies:", error);
    return apiError("INTERNAL_ERROR", "Failed to list replies", 500);
  }
});

// ── POST /api/posts/[id]/replies ────────────────────────────────────

const createReplySchema = z.object({
  body: z.string().min(1, "Reply body is required").max(1000, "Reply body must be at most 1000 characters"),
});

export const POST = withAuth(async (request, context, session) => {
  try {
    const { id: postId } = await context.params;

    // Verify post exists and is active
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true, feedType: true },
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

    const parsed = await parseBody(request, createReplySchema);
    if (parsed.error) return parsed.error;
    const { body } = parsed.data;

    const reply = await db.postReply.create({
      data: {
        postId,
        authorId: session.user.id,
        body,
        status: "ACTIVE",
      },
      include: {
        author: { select: authorSelect },
      },
    });

    return apiSuccess(reply, 201);
  } catch (error) {
    console.error("Error creating reply:", error);
    return apiError("INTERNAL_ERROR", "Failed to create reply", 500);
  }
});
