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

// ── GET /api/posts ──────────────────────────────────────────────────

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const feedType = searchParams.get("feedType");

    if (!feedType || !["CAMPUS", "NETWORK"].includes(feedType)) {
      return apiError(
        "VALIDATION_ERROR",
        "feedType query param is required (CAMPUS or NETWORK)",
        422
      );
    }

    // Campus feed: students only
    if (feedType === "CAMPUS") {
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

    const { page, pageSize, skip } = parsePagination(searchParams);

    const where = {
      feedType,
      status: "ACTIVE",
    };

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: { select: authorSelect },
          _count: {
            select: {
              replies: { where: { status: "ACTIVE" } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.post.count({ where }),
    ]);

    return apiSuccess({
      items: posts,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error listing posts:", error);
    return apiError("INTERNAL_ERROR", "Failed to list posts", 500);
  }
});

// ── POST /api/posts ─────────────────────────────────────────────────

const createPostSchema = z.object({
  feedType: z.enum(["CAMPUS", "NETWORK"]),
  body: z.string().min(1, "Post body is required").max(2000, "Post body must be at most 2000 characters"),
});

export const POST = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, createPostSchema);
    if (parsed.error) return parsed.error;
    const { feedType, body } = parsed.data;

    // Campus feed: students only
    if (feedType === "CAMPUS") {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: { userType: true },
      });
      if (user?.userType !== "STUDENT") {
        return apiError(
          "FORBIDDEN",
          "Only students can post to the Campus feed",
          403
        );
      }
    }

    const post = await db.post.create({
      data: {
        authorId: session.user.id,
        feedType,
        body,
        status: "ACTIVE",
      },
      include: {
        author: { select: authorSelect },
        _count: {
          select: {
            replies: { where: { status: "ACTIVE" } },
          },
        },
      },
    });

    return apiSuccess(post, 201);
  } catch (error) {
    console.error("Error creating post:", error);
    return apiError("INTERNAL_ERROR", "Failed to create post", 500);
  }
});
