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

// ── GET /api/events/[id] ────────────────────────────────────────────

export const GET = withAuth(
  async (_request: NextRequest, context, session: AuthSession) => {
    try {
      const { id } = (await context.params) as { id: string };

      const event = await db.event.findUnique({
        where: { id },
        include: {
          createdByUser: {
            select: { id: true, fullName: true, photoUrl: true },
          },
          createdByAdmin: { select: { id: true, name: true } },
          rsvps: {
            include: {
              user: {
                select: { id: true, fullName: true, photoUrl: true },
              },
            },
            orderBy: { rsvpAt: "asc" },
          },
          niches: {
            include: {
              niche: { select: { id: true, displayName: true } },
            },
          },
          invites: {
            select: { inviteeId: true, status: true },
          },
        },
      });

      if (!event) {
        return apiError("NOT_FOUND", "Event not found", 404);
      }

      // Access control for PRIVATE events
      if (event.visibility === "PRIVATE") {
        const isCreator = event.createdByUserId === session.user.id;
        const isInvited = event.invites.some(
          (inv) => inv.inviteeId === session.user.id
        );
        if (!isCreator && !isInvited) {
          return apiError("FORBIDDEN", "You do not have access to this event", 403);
        }
      }

      const userId = session.user.id;
      const userRsvp = event.rsvps.find((r) => r.userId === userId);
      const attendingRsvps = event.rsvps.filter(
        (r) => r.status === "ATTENDING"
      );

      return apiSuccess({
        id: event.id,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        timezone: event.timezone,
        location: event.location,
        capacity: event.capacity,
        visibility: event.visibility,
        coverImageUrl: event.coverImageUrl,
        createdByUserId: event.createdByUserId,
        creator: event.createdByUser
          ? {
              id: event.createdByUser.id,
              name: event.createdByUser.fullName,
              photoUrl: event.createdByUser.photoUrl,
            }
          : event.createdByAdmin
          ? { id: event.createdByAdmin.id, name: event.createdByAdmin.name, photoUrl: null }
          : null,
        rsvpCount: attendingRsvps.length,
        userRsvpStatus: userRsvp?.status ?? null,
        attendees: event.rsvps.map((r) => ({
          id: r.user.id,
          name: r.user.fullName,
          photoUrl: r.user.photoUrl,
          status: r.status,
        })),
        niches: event.niches.map((en) => en.niche),
      });
    } catch (error) {
      console.error("Error fetching event detail:", error);
      return apiError("INTERNAL_ERROR", "Failed to fetch event", 500);
    }
  }
);

// ── PATCH /api/events/[id] ──────────────────────────────────────────

const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  eventType: z
    .enum(["PANEL", "WORKSHOP", "REUNION", "DINNER", "TALK", "MEETUP", "OTHER"])
    .optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().nullable().optional(),
  location: z.string().max(500).nullable().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

export const PATCH = withAuth(
  async (request: NextRequest, context, session: AuthSession) => {
    try {
      const { id } = (await context.params) as { id: string };

      const event = await db.event.findUnique({ where: { id } });
      if (!event) {
        return apiError("NOT_FOUND", "Event not found", 404);
      }

      if (event.createdByUserId !== session.user.id) {
        return apiError("FORBIDDEN", "Only the creator can update this event", 403);
      }

      const parsed = await parseBody(request, updateEventSchema);
      if (parsed.error) return parsed.error;
      const data = parsed.data;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const update: Record<string, any> = {};
      if (data.title !== undefined) update.title = data.title;
      if (data.description !== undefined) update.description = data.description;
      if (data.eventType !== undefined) update.eventType = data.eventType;
      if (data.startsAt !== undefined) update.startsAt = new Date(data.startsAt);
      if (data.endsAt !== undefined)
        update.endsAt = data.endsAt ? new Date(data.endsAt) : null;
      if (data.location !== undefined) update.location = data.location;
      if (data.capacity !== undefined) update.capacity = data.capacity;
      if (data.visibility !== undefined) update.visibility = data.visibility;

      const updated = await db.event.update({
        where: { id },
        data: update,
      });

      return apiSuccess({ id: updated.id });
    } catch (error) {
      console.error("Error updating event:", error);
      return apiError("INTERNAL_ERROR", "Failed to update event", 500);
    }
  }
);
