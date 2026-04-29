"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  GraduationCap,
  Calendar,
  Inbox,
} from "lucide-react";
import { apiFetch } from "@/hooks/use-api";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface MentorshipUser {
  id: string;
  fullName: string;
  photoUrl: string | null;
}

interface MentorshipItem {
  id: string;
  mentorUserId: string;
  menteeUserId: string;
  mentor: MentorshipUser;
  mentee: MentorshipUser;
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  goal: string | null;
  cadence: string | null;
  sessionCount: number;
  conversationId: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: "bg-[var(--intent-green-subtle)]", text: "text-[var(--intent-green)]", label: "Active" },
    PAUSED: { bg: "bg-[var(--intent-amber-subtle)]", text: "text-[var(--intent-amber)]", label: "Paused" },
    COMPLETED: { bg: "bg-[var(--muted)]", text: "text-[var(--intent-text-secondary)]", label: "Completed" },
    CANCELLED: { bg: "bg-[var(--muted)]", text: "text-[var(--intent-text-secondary)]", label: "Cancelled" },
  };
  const c = config[status] ?? config.ACTIVE;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", c.bg, c.text)}>
      {c.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton                                                            */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--intent-text-tertiary)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-[var(--intent-text-tertiary)]" />
          <div className="h-3 w-48 rounded bg-[var(--intent-text-tertiary)]" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function MentorshipsPage() {
  const router = useRouter();

  // Fetch current user
  const { data: me } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/users/me"),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch mentorships
  const {
    data: mentorships,
    isLoading,
    isError,
  } = useQuery<{ items: MentorshipItem[] }>({
    queryKey: ["mentorships"],
    queryFn: () => apiFetch("/api/mentorships"),
  });

  // Separate by role
  const allMentorships = mentorships?.items ?? [];
  const asMentor = allMentorships.filter((m) => m.mentorUserId === me?.id);
  const asMentee = allMentorships.filter((m) => m.menteeUserId === me?.id);
  const isEmpty = asMentor.length === 0 && asMentee.length === 0;

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex h-14 items-center border-b border-[var(--intent-text-tertiary)] bg-white/95 px-4 backdrop-blur-md safe-top">
        <button
          onClick={() => router.push("/matching")}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={1.5} className="text-[var(--intent-text-primary)]" />
        </button>
        <h1 className="ml-2 text-[16px] font-semibold text-[var(--intent-text-primary)]">
          Mentorships
        </h1>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pb-32 pt-6">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-[var(--intent-text-secondary)]">Could not load mentorships</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl"
            >
              Retry
            </Button>
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
              <Inbox size={28} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
            </div>
            <p className="mt-4 text-[15px] font-medium text-[var(--intent-text-primary)]">
              No mentorships yet
            </p>
            <p className="mt-1 text-center text-[13px] text-[var(--intent-text-secondary)]">
              When the matching engine pairs you with a mentor or mentee, they will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* As Mentor */}
            {asMentor.length > 0 && (
              <div>
                <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
                  As Mentor
                </h3>
                <div className="space-y-3">
                  {asMentor.map((m) => (
                    <MentorshipCard
                      key={m.id}
                      item={m}
                      otherUser={m.mentee}
                      role="mentor"
                      onClick={() => router.push(`/matching/mentorship/${m.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* As Mentee */}
            {asMentee.length > 0 && (
              <div className={asMentor.length > 0 ? "mt-6" : ""}>
                <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
                  As Mentee
                </h3>
                <div className="space-y-3">
                  {asMentee.map((m) => (
                    <MentorshipCard
                      key={m.id}
                      item={m}
                      otherUser={m.mentor}
                      role="mentee"
                      onClick={() => router.push(`/matching/mentorship/${m.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mentorship card                                                     */
/* ------------------------------------------------------------------ */

function MentorshipCard({
  item,
  otherUser,
  role,
  onClick,
}: {
  item: MentorshipItem;
  otherUser: MentorshipUser;
  role: "mentor" | "mentee";
  onClick: () => void;
}) {
  return (
    <div
      className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4 transition-shadow hover:shadow-[var(--card-shadow)]"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="flex items-start gap-3">
        <AvatarPlaceholder name={otherUser.fullName} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-[var(--intent-text-primary)]">
              {otherUser.fullName}
            </p>
            <StatusBadge status={item.status} />
          </div>
          {item.goal && (
            <p className="mt-0.5 truncate text-[13px] text-[var(--intent-text-secondary)]">
              {item.goal}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
              <GraduationCap size={11} />
              {role === "mentor" ? "You mentor" : "Your mentor"}
            </span>
            {item.cadence && (
              <span className="flex items-center gap-1 text-[12px] text-[var(--intent-text-secondary)]">
                <Calendar size={12} />
                {item.cadence}
              </span>
            )}
            <span className="text-[12px] text-[var(--intent-text-secondary)]">
              {item.sessionCount} session{item.sessionCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className="mt-1 shrink-0 text-[var(--intent-text-secondary)]" />
      </div>
    </div>
  );
}
