import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parseBody,
  type AuthSession,
} from "@/lib/api-helpers";

// ── POST /api/events/[id]/invite ────────────────────────────────────

const inviteSchema = z.object({
  inviteeIds: z.array(z.string().min(1)).min(1),
});

export const POST = withAuth(
  async (request: NextRequest, context, session: AuthSession) => {
    try {
      const { id } = (await context.params) as { id: string };
      const userId = session.user.id;

      const event = await db.event.findUnique({ where: { id } });
      if (!event) {
        return apiError("NOT_FOUND", "Event not found", 404);
      }

      if (event.createdByUserId !== userId) {
        return apiError(
          "FORBIDDEN",
          "Only the event creator can send invites",
          403
        );
      }

      if (event.visibility !== "PRIVATE") {
        return apiError(
          "VALIDATION_ERROR",
          "Invitations are only for private events",
          422
        );
      }

      const parsed = await parseBody(request, inviteSchema);
      if (parsed.error) return parsed.error;
      const { inviteeIds } = parsed.data;

      // Filter out already-invited users to avoid unique constraint errors
      const existingInvites = await db.eventInvite.findMany({
        where: { eventId: id, inviteeId: { in: inviteeIds } },
        select: { inviteeId: true },
      });
      const existingSet = new Set(existingInvites.map((i) => i.inviteeId));
      const newInviteeIds = inviteeIds.filter((iid) => !existingSet.has(iid));

      if (newInviteeIds.length > 0) {
        await db.eventInvite.createMany({
          data: newInviteeIds.map((inviteeId) => ({
            eventId: id,
            inviterId: userId,
            inviteeId,
          })),
        });
      }

      return apiSuccess({
        invited: newInviteeIds.length,
        alreadyInvited: existingSet.size,
      }, 201);
    } catch (error) {
      console.error("Error inviting users:", error);
      return apiError("INTERNAL_ERROR", "Failed to send invites", 500);
    }
  }
);
