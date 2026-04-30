"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  Calendar,
  MapPin,
  Clock,
  Users,
  Lock,
  Globe,
  Check,
  UserPlus,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { apiFetch } from "@/hooks/use-api";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface EventAttendee {
  id: string;
  name: string;
  photoUrl: string | null;
  status: string;
}

interface NicheItem {
  id: string;
  displayName: string;
}

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  eventType: string | null;
  startsAt: string;
  endsAt: string | null;
  timezone: string;
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
  attendees: EventAttendee[];
  niches: NicheItem[];
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
/* Invite modal                                                        */
/* ------------------------------------------------------------------ */

interface UserSearchResult {
  id: string;
  fullName: string;
  photoUrl: string | null;
}

interface DiscoveryResponse {
  items: UserSearchResult[];
}

function InviteModal({
  eventId,
  onClose,
}: {
  eventId: string;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery<DiscoveryResponse>({
    queryKey: ["invite-search", search],
    queryFn: () => apiFetch(`/api/discovery?q=${encodeURIComponent(search)}`),
    enabled: search.length >= 2,
  });

  const inviteMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/events/${eventId}/invite`, {
        method: "POST",
        body: JSON.stringify({ inviteeIds: selectedIds }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      onClose();
    },
  });

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
        <h2 className="text-[18px] font-bold text-[var(--intent-text-primary)]">
          Invite People
        </h2>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 h-10 w-full rounded-lg border border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)] px-3 text-[14px] outline-none focus:border-[var(--intent-navy)]"
        />
        <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={20} className="animate-spin text-[var(--intent-text-secondary)]" />
            </div>
          )}
          {users?.items?.map((user) => (
            <button
              key={user.id}
              onClick={() => toggleUser(user.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors",
                selectedIds.includes(user.id)
                  ? "bg-[var(--intent-navy-subtle)]"
                  : "hover:bg-[var(--muted)]"
              )}
            >
              <AvatarPlaceholder name={user.fullName} size={32} />
              <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
                {user.fullName}
              </span>
              {selectedIds.includes(user.id) && (
                <Check size={16} className="text-[var(--intent-navy)]" />
              )}
            </button>
          ))}
          {search.length >= 2 && !isLoading && !users?.items?.length && (
            <p className="py-4 text-center text-[13px] text-[var(--intent-text-secondary)]">
              No users found
            </p>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 flex-1 rounded-xl border-[var(--intent-text-tertiary)] text-[14px] font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={() => inviteMutation.mutate()}
            disabled={selectedIds.length === 0 || inviteMutation.isPending}
            className="h-11 flex-1 rounded-xl bg-[var(--intent-navy)] text-[14px] font-semibold text-white hover:bg-[var(--intent-navy-light)] disabled:opacity-50"
          >
            {inviteMutation.isPending ? "Sending..." : `Invite (${selectedIds.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);

  // Fetch current user
  const { data: me } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/users/me"),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch event detail
  const {
    data: event,
    isLoading,
    isError,
  } = useQuery<EventDetail>({
    queryKey: ["event", eventId],
    queryFn: () => apiFetch(`/api/events/${eventId}`),
    enabled: !!eventId,
  });

  // RSVP
  const rsvpMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/events/${eventId}/rsvp`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });

  // Un-RSVP
  const unRsvpMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/api/events/${eventId}/rsvp`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });

  /* ── Loading ──────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--intent-bg)]">
        <Loader2 className="size-8 animate-spin text-[var(--intent-navy)]" />
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────── */

  if (isError || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--intent-bg)]">
        <p className="text-[var(--intent-text-secondary)]">Event not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/spaces")}
          className="rounded-xl"
        >
          Back to Spaces
        </Button>
      </div>
    );
  }

  /* ── Derived values ───────────────────────────────────────────── */

  const isCreator = me?.id === event.createdByUserId;
  const isAttending = event.userRsvpStatus === "ATTENDING";
  const isWaitlisted = event.userRsvpStatus === "WAITLISTED";
  const hasRsvp = isAttending || isWaitlisted;
  const spotsLeft =
    event.capacity != null ? event.capacity - event.rsvpCount : null;
  const attendingList = event.attendees.filter(
    (a) => a.status === "ATTENDING"
  );
  const waitlistedList = event.attendees.filter(
    (a) => a.status === "WAITLISTED"
  );

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex h-14 items-center border-b border-[var(--intent-text-tertiary)] bg-white/95 px-4 backdrop-blur-md safe-top">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
          aria-label="Go back"
        >
          <ChevronLeft
            size={22}
            strokeWidth={1.5}
            className="text-[var(--intent-text-primary)]"
          />
        </button>
        <h1 className="ml-2 truncate text-[16px] font-semibold text-[var(--intent-text-primary)]">
          Event Details
        </h1>
        {isCreator && (
          <Link
            href={`/spaces/create?edit=${eventId}`}
            className="ml-auto flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-[var(--intent-text-secondary)] transition-colors hover:bg-[var(--muted)]"
          >
            <Pencil size={14} />
            Edit
          </Link>
        )}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pb-40 pt-6">
        {/* Header badges */}
        <div className="flex flex-wrap items-center gap-2">
          {event.eventType && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider",
                EVENT_TYPE_COLORS[event.eventType] ??
                  EVENT_TYPE_COLORS.OTHER
              )}
            >
              {event.eventType}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider",
              event.visibility === "PRIVATE"
                ? "bg-red-50 text-red-600"
                : "bg-[var(--intent-green-subtle)] text-[var(--intent-green)]"
            )}
          >
            {event.visibility === "PRIVATE" ? (
              <Lock size={12} />
            ) : (
              <Globe size={12} />
            )}
            {event.visibility}
          </span>
        </div>

        {/* Title */}
        <h2 className="mt-4 text-[22px] font-bold leading-snug text-[var(--intent-text-primary)]">
          {event.title}
        </h2>

        {/* Date & time */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-[14px] text-[var(--intent-text-secondary)]">
            <Calendar size={16} strokeWidth={1.5} className="shrink-0" />
            <span>
              {format(new Date(event.startsAt), "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[14px] text-[var(--intent-text-secondary)]">
            <Clock size={16} strokeWidth={1.5} className="shrink-0" />
            <span>
              {format(new Date(event.startsAt), "h:mm a")}
              {event.endsAt && (
                <> &ndash; {format(new Date(event.endsAt), "h:mm a")}</>
              )}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-[14px] text-[var(--intent-text-secondary)]">
              <MapPin size={16} strokeWidth={1.5} className="shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Creator */}
        {event.creator && (
          <div className="mt-4 flex items-center gap-3">
            <AvatarPlaceholder name={event.creator.name} size={36} />
            <div>
              <p className="text-[13px] text-[var(--intent-text-secondary)]">
                Hosted by
              </p>
              <p className="text-[14px] font-medium text-[var(--intent-text-primary)]">
                {event.creator.name}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        {event.description && (
          <div className="mt-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
              About
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--intent-text-primary)]">
              {event.description}
            </p>
          </div>
        )}

        {/* Niche pills */}
        {event.niches.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Related Niches
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {event.niches.map((n) => (
                <span
                  key={n.id}
                  className="rounded-full bg-[var(--intent-navy-subtle)] px-3 py-1 text-[12px] font-medium text-[var(--intent-navy)]"
                >
                  {n.displayName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Capacity info */}
        {event.capacity != null && (
          <div className="mt-6 flex items-center gap-2">
            <Users
              size={16}
              className="text-[var(--intent-text-secondary)]"
            />
            <span className="text-[14px] text-[var(--intent-text-secondary)]">
              {event.rsvpCount} / {event.capacity} spots filled
              {spotsLeft != null && spotsLeft > 0 && (
                <> &middot; {spotsLeft} remaining</>
              )}
            </span>
          </div>
        )}

        {/* Attendee list */}
        {attendingList.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Attending ({attendingList.length})
            </h3>
            <div className="mt-3 space-y-2">
              {attendingList.map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <AvatarPlaceholder name={a.name} size={32} />
                  <span className="text-[14px] text-[var(--intent-text-primary)]">
                    {a.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {waitlistedList.length > 0 && (
          <div className="mt-4">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Waitlisted ({waitlistedList.length})
            </h3>
            <div className="mt-3 space-y-2">
              {waitlistedList.map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <AvatarPlaceholder name={a.name} size={32} />
                  <span className="text-[14px] text-[var(--intent-text-secondary)]">
                    {a.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky bottom action bar ────────────────────────────── */}
      <div
        className="fixed inset-x-0 bottom-16 z-30 border-t bg-white/95 backdrop-blur-md safe-bottom"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex max-w-[640px] items-center gap-3 px-4 py-3">
          {/* Invite button (creator + private) */}
          {isCreator && event.visibility === "PRIVATE" && (
            <Button
              variant="outline"
              onClick={() => setShowInvite(true)}
              className="h-12 flex-shrink-0 rounded-xl border-[var(--intent-text-tertiary)] text-[14px] font-medium"
            >
              <UserPlus size={16} className="mr-1.5" />
              Invite
            </Button>
          )}

          {/* RSVP button */}
          {hasRsvp ? (
            <Button
              onClick={() => unRsvpMutation.mutate()}
              disabled={unRsvpMutation.isPending}
              className={cn(
                "h-12 flex-1 rounded-xl text-[15px] font-semibold",
                isAttending
                  ? "bg-[var(--intent-green-subtle)] text-[var(--intent-green)] hover:bg-[var(--intent-green)]/20"
                  : "bg-[var(--intent-navy-subtle)] text-[var(--intent-navy)] hover:bg-[var(--intent-navy)]/20"
              )}
            >
              <Check size={18} className="mr-2" />
              {isAttending ? "Attending" : "Waitlisted"}
            </Button>
          ) : (
            <Button
              onClick={() => rsvpMutation.mutate()}
              disabled={rsvpMutation.isPending}
              className="h-12 flex-1 rounded-xl bg-[var(--intent-navy)] text-[15px] font-semibold text-white hover:bg-[var(--intent-navy-light)]"
            >
              Join Event
            </Button>
          )}
        </div>
      </div>

      {/* ── Invite modal ──────────────────────────────────────────── */}
      {showInvite && (
        <InviteModal
          eventId={eventId}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
