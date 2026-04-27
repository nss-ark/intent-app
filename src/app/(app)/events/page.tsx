"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  CalendarPlus,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/hooks/use-api";

/* ------------------------------------------------------------------ */
/* Event types                                                         */
/* ------------------------------------------------------------------ */

type EventType = "matched" | "admin";
type EventTab = "upcoming" | "past";

interface EventAttendee {
  name: string;
}

interface EventItem {
  id: string;
  type: EventType;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees?: EventAttendee[];
  confirmedCount?: number;
  totalCount?: number;
  goingCount?: number;
  spotsLeft?: number;
  tab: EventTab;
  expanded?: boolean;
}

/* ------------------------------------------------------------------ */
/* Data fetching                                                       */
/* ------------------------------------------------------------------ */

interface SurveyFromAPI {
  id: string;
  title: string;
  status: string;
  publishedAt: string | null;
  closesAt: string | null;
  hasResponded: boolean;
  _count: { questions: number };
}

function useSurveyEvents() {
  return useQuery<EventItem[]>({
    queryKey: ["events-from-surveys"],
    queryFn: async () => {
      try {
        const surveys: SurveyFromAPI[] = await apiFetch("/api/surveys");
        // Map surveys into "matched meetup" event cards
        const now = new Date();
        return surveys.map((s) => {
          const closesAt = s.closesAt ? new Date(s.closesAt) : null;
          const isPast = closesAt ? closesAt < now : false;
          return {
            id: s.id,
            type: "matched" as EventType,
            title: s.title,
            date: s.publishedAt
              ? new Date(s.publishedAt).toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })
              : "TBD",
            time: s.publishedAt
              ? new Date(s.publishedAt).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "",
            location: "Community survey",
            confirmedCount: s.hasResponded ? 1 : 0,
            totalCount: s._count.questions,
            tab: isPast ? ("past" as EventTab) : ("upcoming" as EventTab),
          };
        });
      } catch {
        // Gracefully fall back to empty
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
  });
}

/* ------------------------------------------------------------------ */
/* Type pill                                                           */
/* ------------------------------------------------------------------ */

function TypePill({ type }: { type: EventType }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full px-2.5 text-[10px] font-semibold uppercase tracking-wider",
        type === "matched"
          ? "bg-[var(--intent-green)] text-white"
          : "bg-[var(--intent-amber)] text-white"
      )}
    >
      {type === "matched" ? "Matched meetup" : "Admin-organized"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Avatar stack                                                        */
/* ------------------------------------------------------------------ */

function AvatarStack({ attendees }: { attendees: EventAttendee[] }) {
  return (
    <div className="flex items-center -space-x-2">
      {attendees.slice(0, 5).map((a, i) => (
        <div
          key={i}
          className="rounded-full ring-2 ring-white"
          style={{ zIndex: attendees.length - i }}
        >
          <AvatarPlaceholder name={a.name} size={32} />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Expanded event card                                                 */
/* ------------------------------------------------------------------ */

function ExpandedEventCard({ event }: { event: EventItem }) {
  return (
    <div className="intent-card rounded-2xl p-5">
      <TypePill type={event.type} />

      <h3 className="mt-3 text-[18px] font-semibold leading-snug text-[var(--intent-text-primary)]">
        {event.title}
      </h3>

      {/* Date */}
      <div className="mt-3 flex items-center gap-2 text-[14px] text-[var(--intent-text-secondary)]">
        <Calendar size={16} strokeWidth={1.5} className="shrink-0 text-[var(--intent-text-secondary)]" />
        <span>
          {event.date} &middot; {event.time}
        </span>
      </div>

      {/* Location */}
      <div className="mt-2 flex items-center gap-2 text-[14px] text-[var(--intent-text-secondary)]">
        <MapPin size={16} strokeWidth={1.5} className="shrink-0 text-[var(--intent-text-secondary)]" />
        <span>{event.location}</span>
      </div>

      {/* Attendees */}
      {event.attendees && event.attendees.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <AvatarStack attendees={event.attendees} />
          <span className="text-[13px] font-medium text-[var(--intent-green)]">
            {event.confirmedCount} of {event.totalCount} confirmed
          </span>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-4 flex items-center gap-3">
        <button className="flex h-11 flex-[60] items-center justify-center rounded-xl bg-[var(--intent-amber)] text-[14px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)]">
          View details
        </button>
        <button className="flex h-11 flex-[32] items-center justify-center gap-2 rounded-xl border border-[var(--intent-text-tertiary)] bg-white text-[14px] font-medium text-[var(--intent-text-primary)] transition-colors hover:bg-[var(--muted)]">
          <CalendarPlus size={16} strokeWidth={1.5} />
          Add to calendar
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compact event card                                                  */
/* ------------------------------------------------------------------ */

function CompactEventCard({ event }: { event: EventItem }) {
  const isAdmin = event.type === "admin";

  return (
    <div className="intent-card rounded-2xl p-5">
      <TypePill type={event.type} />

      <h3 className="mt-3 text-[16px] font-semibold leading-snug text-[var(--intent-text-primary)]">
        {event.title}
      </h3>

      {/* Date + Location row */}
      <div className="mt-2.5 flex items-center gap-4 text-[13px] text-[var(--intent-text-secondary)]">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} strokeWidth={1.5} />
          {event.date} &middot; {event.time}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[var(--intent-text-secondary)]">
        <MapPin size={14} strokeWidth={1.5} className="shrink-0" />
        <span>{event.location}</span>
      </div>

      {/* Status row */}
      <div className="mt-3 flex items-center justify-between">
        {isAdmin ? (
          <span className="text-[13px] text-[var(--intent-text-secondary)]">
            {event.goingCount} going
            {event.spotsLeft != null && (
              <> &middot; {event.spotsLeft} spots left</>
            )}
          </span>
        ) : (
          <span className="text-[13px] text-[var(--intent-text-secondary)]">
            {event.confirmedCount} of {event.totalCount} confirmed
          </span>
        )}

        {isAdmin && event.spotsLeft != null && (
          <button className="inline-flex h-9 items-center gap-1 rounded-xl bg-[var(--intent-amber)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)]">
            RSVP
            <ChevronRight size={14} strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<EventTab>("upcoming");
  const { data: events = [], isLoading } = useSurveyEvents();

  const filteredEvents = events.filter((e) => e.tab === activeTab);

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto max-w-[800px] px-4">
          {/* Title row */}
          <div className="flex h-14 items-center justify-between">
            <h1 className="text-[22px] font-bold text-[var(--intent-text-primary)]">
              Events
            </h1>
            <Calendar
              size={22}
              strokeWidth={1.5}
              className="text-[var(--intent-text-secondary)]"
            />
          </div>

          {/* Tab bar */}
          <div className="flex gap-6 -mb-px">
            {(["upcoming", "past"] as EventTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-[14px] font-medium capitalize transition-colors border-b-2",
                  activeTab === tab
                    ? "border-[var(--intent-amber)] text-[var(--intent-amber)]"
                    : "border-transparent text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Event list ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-[800px] px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2
              size={32}
              className="animate-spin text-[var(--intent-text-secondary)]"
            />
            <p className="mt-3 text-[14px] text-[var(--intent-text-secondary)]">
              Loading events...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
              <Calendar
                size={28}
                className="text-[var(--intent-text-secondary)]"
              />
            </div>
            <h3 className="text-base font-semibold text-[var(--intent-text-primary)]">
              No {activeTab} events
            </h3>
            <p className="mt-1 text-[14px] text-[var(--intent-text-secondary)]">
              {activeTab === "upcoming"
                ? "Check back soon for new events."
                : "Your past events will appear here."}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) =>
            event.expanded ? (
              <ExpandedEventCard key={event.id} event={event} />
            ) : (
              <CompactEventCard key={event.id} event={event} />
            )
          )
        )}
      </div>
    </div>
  );
}
