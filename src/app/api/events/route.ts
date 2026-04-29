import { z } from "zod";
import { db } from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withAuth,
  parsePagination,
  parseBody,
} from "@/lib/api-helpers";

// ── Reusable selects ────────────────────────────────────────────────

const creatorUserSelect = {
  id: true,
  fullName: true,
  photoUrl: true,
} as const;

// ── GET /api/events ─────────────────────────────────────────────────

export const GET = withAuth(async (request, _context, session) => {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") ?? "all";
    const nicheId = searchParams.get("nicheId");
    const { page, pageSize, skip } = parsePagination(searchParams);

    const userId = session.user.id;
    const now = new Date();

    // Build dynamic where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isPublished: true,
      startsAt: { gte: now },
    };

    if (filter === "mine") {
      where.createdByUserId = userId;
      // Show all my events, including past
      delete where.startsAt;
    } else if (filter === "public") {
      where.visibility = "PUBLIC";
    } else if (filter === "group_intent") {
      // Events linked to niches
      where.niches = { some: {} };
      if (nicheId) {
        where.niches = { some: { nicheId } };
      }
      // Public or user is invited/creator
      where.OR = [
        { visibility: "PUBLIC" },
        { createdByUserId: userId },
        { invites: { some: { inviteeId: userId } } },
      ];
    } else {
      // "all" — public events + private events the user can see
      where.OR = [
        { visibility: "PUBLIC" },
        { createdByUserId: userId },
        { invites: { some: { inviteeId: userId } } },
      ];
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        include: {
          createdByUser: { select: creatorUserSelect },
          createdByAdmin: { select: { id: true, name: true } },
          rsvps: {
            select: { id: true, userId: true, status: true },
          },
          niches: {
            include: {
              niche: { select: { id: true, displayName: true } },
            },
          },
        },
        orderBy: { startsAt: "asc" },
        skip,
        take: pageSize,
      }),
      db.event.count({ where }),
    ]);

    const items = events.map((event) => {
      const rsvpCount = event.rsvps.filter(
        (r) => r.status === "ATTENDING"
      ).length;
      const userRsvp = event.rsvps.find((r) => r.userId === userId);
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
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
        rsvpCount,
        userRsvpStatus: userRsvp?.status ?? null,
        niches: event.niches.map((en) => en.niche),
      };
    });

    return apiSuccess({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error listing events:", error);
    return apiError("INTERNAL_ERROR", "Failed to list events", 500);
  }
});

// ── POST /api/events ────────────────────────────────────────────────

const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  eventType: z
    .enum(["PANEL", "WORKSHOP", "REUNION", "DINNER", "TALK", "MEETUP", "OTHER"])
    .optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().optional(),
  location: z.string().max(500).optional(),
  capacity: z.number().int().positive().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  nicheIds: z.array(z.string().min(1)).optional(),
});

export const POST = withAuth(async (request, _context, session) => {
  try {
    const parsed = await parseBody(request, createEventSchema);
    if (parsed.error) return parsed.error;
    const {
      title,
      description,
      eventType,
      startsAt,
      endsAt,
      location,
      capacity,
      visibility,
      nicheIds,
    } = parsed.data;

    const event = await db.$transaction(async (tx) => {
      const created = await tx.event.create({
        data: {
          title,
          description: description ?? null,
          eventType: eventType ?? null,
          startsAt: new Date(startsAt),
          endsAt: endsAt ? new Date(endsAt) : null,
          location: location ?? null,
          capacity: capacity ?? null,
          visibility,
          source: "USER_CREATED",
          createdByUserId: session.user.id,
          isPublished: true,
        },
      });

      // Link niches if provided
      if (nicheIds && nicheIds.length > 0) {
        await tx.eventNiche.createMany({
          data: nicheIds.map((nicheId) => ({
            eventId: created.id,
            nicheId,
          })),
        });
      }

      return created;
    });

    return apiSuccess({ id: event.id }, 201);
  } catch (error) {
    console.error("Error creating event:", error);
    return apiError("INTERNAL_ERROR", "Failed to create event", 500);
  }
});
