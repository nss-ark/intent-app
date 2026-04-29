import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  type AuthSession,
} from "@/lib/api-helpers";

// ── POST /api/events/[id]/rsvp ──────────────────────────────────────

export const POST = withAuth(
  async (_request: NextRequest, context, session: AuthSession) => {
    try {
      const { id } = (await context.params) as { id: string };
      const userId = session.user.id;

      const event = await db.event.findUnique({
        where: { id },
        include: {
          invites: { select: { inviteeId: true } },
          rsvps: { select: { userId: true, status: true } },
        },
      });

      if (!event) {
        return apiError("NOT_FOUND", "Event not found", 404);
      }

      // Access control for PRIVATE events
      if (event.visibility === "PRIVATE") {
        const isCreator = event.createdByUserId === userId;
        const isInvited = event.invites.some(
          (inv) => inv.inviteeId === userId
        );
        if (!isCreator && !isInvited) {
          return apiError(
            "FORBIDDEN",
            "You must be invited to RSVP to this event",
            403
          );
        }
      }

      // Check if already RSVP'd
      const existing = event.rsvps.find((r) => r.userId === userId);
      if (existing) {
        return apiError("ALREADY_EXISTS", "You have already RSVP'd to this event", 409);
      }

      // Determine status: ATTENDING or WAITLISTED if capacity is full
      const attendingCount = event.rsvps.filter(
        (r) => r.status === "ATTENDING"
      ).length;
      const status =
        event.capacity && attendingCount >= event.capacity
          ? "WAITLISTED"
          : "ATTENDING";

      const rsvp = await db.eventRsvp.create({
        data: {
          eventId: id,
          userId,
          status,
        },
      });

      return apiSuccess({ id: rsvp.id, status: rsvp.status }, 201);
    } catch (error) {
      console.error("Error creating RSVP:", error);
      return apiError("INTERNAL_ERROR", "Failed to RSVP", 500);
    }
  }
);

// ── DELETE /api/events/[id]/rsvp ────────────────────────────────────

export const DELETE = withAuth(
  async (_request: NextRequest, context, session: AuthSession) => {
    try {
      const { id } = (await context.params) as { id: string };
      const userId = session.user.id;

      const rsvp = await db.eventRsvp.findUnique({
        where: { eventId_userId: { eventId: id, userId } },
      });

      if (!rsvp) {
        return apiError("NOT_FOUND", "RSVP not found", 404);
      }

      await db.eventRsvp.delete({
        where: { id: rsvp.id },
      });

      return apiSuccess({ removed: true });
    } catch (error) {
      console.error("Error removing RSVP:", error);
      return apiError("INTERNAL_ERROR", "Failed to remove RSVP", 500);
    }
  }
);
