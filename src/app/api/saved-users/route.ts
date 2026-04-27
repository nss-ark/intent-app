import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
  parseBody,
} from "@/lib/api-helpers";
import { withTenantAndActive } from "@/lib/tenant";

const savedUserInclude = {
  savedUser: {
    select: {
      id: true,
      fullName: true,
      photoUrl: true,
      profile: {
        select: {
          missionStatement: true,
          currentCity: true,
          currentCountry: true,
        },
      },
      experience: {
        where: { isCurrent: true },
        select: { title: true, freeTextCompanyName: true, company: { select: { name: true } } },
        take: 1,
      },
    },
  },
} as const;

// ── GET /api/saved-users ────────────────────────────────────────────

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = parsePagination(searchParams);

    const where = { userId: session.user.id };

    const [savedUsers, total] = await Promise.all([
      db.savedUser.findMany({
        where,
        include: savedUserInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      db.savedUser.count({ where }),
    ]);

    return apiSuccess({
      items: savedUsers,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error listing saved users:", error);
    return apiError("INTERNAL_ERROR", "Failed to list saved users", 500);
  }
});

// ── POST /api/saved-users ───────────────────────────────────────────

const saveUserSchema = z.object({
  userId: z.string().min(1),
});

export const POST = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, saveUserSchema);
    if (parsed.error) return parsed.error;
    const { userId: targetUserId } = parsed.data;

    if (targetUserId === session.user.id) {
      return apiError("VALIDATION_ERROR", "You cannot save yourself", 422);
    }

    // Verify user exists, same tenant, not deleted
    const targetUser = await db.user.findFirst({
      where: {
        id: targetUserId,
        ...withTenantAndActive(session),
      },
    });

    if (!targetUser) {
      return apiError("NOT_FOUND", "User not found", 404);
    }

    // Check for existing save
    const existing = await db.savedUser.findUnique({
      where: {
        userId_savedUserId: {
          userId: session.user.id,
          savedUserId: targetUserId,
        },
      },
    });

    if (existing) {
      return apiError("CONFLICT", "User is already saved", 409);
    }

    const savedUser = await db.savedUser.create({
      data: {
        userId: session.user.id,
        savedUserId: targetUserId,
      },
      include: savedUserInclude,
    });

    return apiSuccess(savedUser, 201);
  } catch (error) {
    console.error("Error saving user:", error);
    return apiError("INTERNAL_ERROR", "Failed to save user", 500);
  }
});

// ── DELETE /api/saved-users ─────────────────────────────────────────

const unsaveUserSchema = z.object({
  userId: z.string().min(1),
});

export const DELETE = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, unsaveUserSchema);
    if (parsed.error) return parsed.error;
    const { userId: targetUserId } = parsed.data;

    const existing = await db.savedUser.findUnique({
      where: {
        userId_savedUserId: {
          userId: session.user.id,
          savedUserId: targetUserId,
        },
      },
    });

    if (!existing) {
      return apiError("NOT_FOUND", "Saved user not found", 404);
    }

    await db.savedUser.delete({
      where: {
        userId_savedUserId: {
          userId: session.user.id,
          savedUserId: targetUserId,
        },
      },
    });

    return apiSuccess({ removed: true });
  } catch (error) {
    console.error("Error removing saved user:", error);
    return apiError("INTERNAL_ERROR", "Failed to remove saved user", 500);
  }
});
