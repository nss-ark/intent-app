"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Plus,
  Loader2,
  Users,
  Lock,
  Globe,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { apiFetch } from "@/hooks/use-api";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type FilterTab = "all" | "mine" | "public" | "group_intent";

interface NicheItem {
  id: string;
  displayName: string;
}

interface EventListItem {
  id: string;
  title: string;
  description: string | null;
  eventType: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  capacity: number | null;
  visibility: "PUBLIC" | "PRIVATE";
  coverImageUrl: string | null;
  createdByUserId: string | null;
  creator: {
    id: string;
    name: string;
    photoUrl: string | null;
  } | null;
  rsvpCount: number;
  userRsvpStatus: string | null;
  niches: NicheItem[];
}

interface EventListResponse {
  items: EventListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface FiltersResponse {
  niches: { id: string; code: string; displayName: string }[];
}

/* ------------------------------------------------------------------ */
/* Event type config                                                   */
/* ------------------------------------------------------------------ */

const EVENT_TYPE_COLORS: Record<string, string> = {
  PANEL: "bg-blue-50 text-blue-700",
  WORKSHOP: "bg-purple-50 text-purple-700",
  REUNION: "bg-pink-50 text-pink-700",
  DINNER: "bg-orange-50 text-orange-700",
  TALK: "bg-teal-50 text-teal-700",
  MEETUP: "bg-[var(--intent-navy-subtle)] text-[var(--intent-navy)]",
  OTHER: "bg-[var(--muted)] text-[var(--intent-text-secondary)]",
};

/* ------------------------------------------------------------------ */
/* Event card                                                          */
/* ------------------------------------------------------------------ */

function EventCard({
  event,
  onRsvp,
  onUnRsvp,
  isRsvping,
}: {
  event: EventListItem;
  onRsvp: (id: string) => void;
  onUnRsvp: (id: string) => void;
  isRsvping: boolean;
}) {
  const router = useRouter();
  const isAttending = event.userRsvpStatus === "ATTENDING";
  const isWaitlisted = event.userRsvpStatus === "WAITLISTED";
  const spotsLeft =
    event.capacity != null ? event.capacity - event.rsvpCount : null;

  return (
    <div
      className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4 transition-shadow hover:shadow-[var(--card-shadow)] cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/activities/${event.id}`)}
      onKeyDown={(e) =>
        e.key === "Enter" && router.push(`/activities/${event.id}`)
      }
    >
      {/* Top row: badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        {event.eventType && (
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider",
              EVENT_TYPE_COLORS[event.eventType] ?? EVENT_TYPE_COLORS.OTHER
            )}
          >
            {event.eventType}
          </span>
        )}
        <span
          className={cn(
            "inline-flex h-5 items-center gap-1 rounded-full px-2 text-[10px] font-semibold uppercase tracking-wider",
            event.visibility === "PRIVATE"
              ? "bg-red-50 text-red-600"
              : "bg-[var(--intent-green-subtle)] text-[var(--intent-green)]"
          )}
        >
          {event.visibility === "PRIVATE" ? (
            <Lock size={10} />
          ) : (
            <Globe size={10} />
          )}
          {event.visibility}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-[16px] font-semibold leading-snug text-[var(--intent-text-primary)]">
        {event.title}
      </h3>

      {/* Date + Location */}
      <div className="mt-2 flex items-center gap-4 text-[13px] text-[var(--intent-text-secondary)]">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} strokeWidth={1.5} />
          {format(new Date(event.startsAt), "EEE, MMM d 'at' h:mm a")}
        </span>
      </div>
      {event.location && (
        <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--intent-text-secondary)]">
          <MapPin size={14} strokeWidth={1.5} className="shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      )}

      {/* Creator + Attendees */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {event.creator && (
            <>
              <AvatarPlaceholder name={event.creator.name} size={24} />
              <span className="text-[12px] text-[var(--intent-text-secondary)]">
                {event.creator.name}
              </span>
            </>
          )}
        </div>
        <span className="flex items-center gap-1 text-[12px] text-[var(--intent-text-secondary)]">
          <Users size={13} />
          {event.rsvpCount} going
          {spotsLeft != null && spotsLeft > 0 && (
            <> &middot; {spotsLeft} spots left</>
          )}
        </span>
      </div>

      {/* Niche pills */}
      {event.niches.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {event.niches.map((n) => (
            <span
              key={n.id}
              className="rounded-full bg-[var(--intent-navy-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--intent-navy)]"
            >
              {n.displayName}
            </span>
          ))}
        </div>
      )}

      {/* RSVP button */}
      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        {isAttending ? (
          <button
            onClick={() => onUnRsvp(event.id)}
            disabled={isRsvping}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--intent-green-subtle)] text-[13px] font-semibold text-[var(--intent-green)] transition-colors hover:bg-[var(--intent-green)]/20 disabled:opacity-50"
          >
            <Check size={14} />
            Attending
          </button>
        ) : isWaitlisted ? (
          <button
            onClick={() => onUnRsvp(event.id)}
            disabled={isRsvping}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--intent-navy-subtle)] text-[13px] font-semibold text-[var(--intent-navy)] transition-colors disabled:opacity-50"
          >
            Waitlisted
          </button>
        ) : (
          <button
            onClick={() => onRsvp(event.id)}
            disabled={isRsvping}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--intent-navy)] text-[13px] font-semibold text-white transition-colors hover:bg-[var(--intent-navy-light)] disabled:opacity-50"
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4">
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-[var(--intent-text-tertiary)]" />
        <div className="h-5 w-14 rounded-full bg-[var(--intent-text-tertiary)]" />
      </div>
      <div className="mt-3 h-5 w-48 rounded bg-[var(--intent-text-tertiary)]" />
      <div className="mt-2 h-4 w-40 rounded bg-[var(--intent-text-tertiary)]" />
      <div className="mt-2 h-4 w-32 rounded bg-[var(--intent-text-tertiary)]" />
      <div className="mt-3 h-9 w-full rounded-lg bg-[var(--intent-text-tertiary)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ActivitiesPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [selectedNicheId, setSelectedNicheId] = useState<string | null>(null);
  const qc = useQueryClient();

  // Fetch niches for "Group Intent" filter
  const { data: filters } = useQuery<FiltersResponse>({
    queryKey: ["discovery-filters"],
    queryFn: () => apiFetch("/api/discovery/filters"),
    staleTime: 5 * 60 * 1000,
  });

  // Build API URL
  const apiUrl = (() => {
    let url = `/api/events?filter=${filter}`;
    if (filter === "group_intent" && selectedNicheId) {
      url += `&nicheId=${selectedNicheId}`;
    }
    return url;
  })();

  // Fetch events
  const {
    data: eventsData,
    isLoading,
  } = useQuery<EventListResponse>({
    queryKey: ["events", filter, selectedNicheId],
    queryFn: () => apiFetch(apiUrl),
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: (eventId: string) =>
      apiFetch(`/api/events/${eventId}/rsvp`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });

  // Un-RSVP mutation
  const unRsvpMutation = useMutation({
    mutationFn: (eventId: string) =>
      apiFetch(`/api/events/${eventId}/rsvp`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const events = eventsData?.items ?? [];
  const isRsvping = rsvpMutation.isPending || unRsvpMutation.isPending;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "mine", label: "My Events" },
    { key: "public", label: "Public" },
    { key: "group_intent", label: "Group Intent" },
  ];

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--intent-text-primary)]">
            Activities
          </h1>
          <Link
            href="/activities/create"
            className="flex h-10 items-center gap-1.5 rounded-xl bg-[var(--intent-navy)] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--intent-navy-light)]"
          >
            <Plus size={18} strokeWidth={2} />
            Create
          </Link>
        </div>

        {/* ── Filter tabs ────────────────────────────────────────── */}
        <div className="mt-4 flex gap-1 rounded-xl bg-[var(--muted)] p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setFilter(t.key);
                if (t.key !== "group_intent") setSelectedNicheId(null);
              }}
              className={cn(
                "flex-1 rounded-lg py-2 text-[13px] font-medium transition-all",
                filter === t.key
                  ? "bg-white text-[var(--intent-text-primary)] shadow-sm"
                  : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Niche selector for Group Intent ────────────────────── */}
        {filter === "group_intent" && filters?.niches && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedNicheId(null)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                selectedNicheId === null
                  ? "bg-[var(--intent-navy)] text-white"
                  : "bg-[var(--muted)] text-[var(--intent-text-secondary)] hover:bg-[var(--intent-navy-subtle)]"
              )}
            >
              All niches
            </button>
            {filters.niches.map((niche) => (
              <button
                key={niche.id}
                onClick={() => setSelectedNicheId(niche.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                  selectedNicheId === niche.id
                    ? "bg-[var(--intent-navy)] text-white"
                    : "bg-[var(--muted)] text-[var(--intent-text-secondary)] hover:bg-[var(--intent-navy-subtle)]"
                )}
              >
                {niche.displayName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Event list ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 py-4 pb-32">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
              <Calendar
                size={28}
                strokeWidth={1.5}
                className="text-[var(--intent-text-secondary)]"
              />
            </div>
            <p className="mt-4 text-[15px] font-medium text-[var(--intent-text-primary)]">
              No upcoming activities
            </p>
            <p className="mt-1 text-center text-[13px] text-[var(--intent-text-secondary)]">
              Create one and bring the community together!
            </p>
            <Link
              href="/activities/create"
              className="mt-4 rounded-xl bg-[var(--intent-navy)] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--intent-navy-light)]"
            >
              Create Activity
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRsvp={(id) => rsvpMutation.mutate(id)}
                onUnRsvp={(id) => unRsvpMutation.mutate(id)}
                isRsvping={isRsvping}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile FAB ──────────────────────────────────────────── */}
      <Link
        href="/activities/create"
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--intent-navy)] text-white shadow-lg transition-transform hover:scale-105 md:hidden"
        aria-label="Create activity"
      >
        <Plus size={24} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
