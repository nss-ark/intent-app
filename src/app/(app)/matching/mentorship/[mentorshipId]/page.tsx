"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  GraduationCap,
  Calendar,
  Target,
  MessageCircle,
  CheckCircle2,
  Circle,
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
  profile: {
    missionStatement: string | null;
    currentCity: string | null;
  } | null;
  domain: { id: string; displayName: string } | null;
}

interface MentorshipSession {
  id: string;
  sessionNumber: number;
  scheduledAt: string | null;
  completedAt: string | null;
  notes: string | null;
}

interface MentorshipDetail {
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
  sessions: MentorshipSession[];
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
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function MentorshipDetailPage({
  params,
}: {
  params: Promise<{ mentorshipId: string }>;
}) {
  const { mentorshipId } = use(params);
  const router = useRouter();

  // Fetch mentorship detail
  const {
    data: mentorship,
    isLoading,
    isError,
  } = useQuery<MentorshipDetail>({
    queryKey: ["mentorship", mentorshipId],
    queryFn: () => apiFetch(`/api/mentorships/${mentorshipId}`),
    enabled: !!mentorshipId,
  });

  /* ── Loading ──────────────────────────────────────────────────── */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--intent-bg)]">
        <Loader2 className="size-8 animate-spin text-[var(--intent-amber)]" />
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────── */

  if (isError || !mentorship) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--intent-bg)]">
        <p className="text-[var(--intent-text-secondary)]">Mentorship not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/matching/mentorship")}
          className="rounded-xl"
        >
          Back to mentorships
        </Button>
      </div>
    );
  }

  const sessions = mentorship.sessions ?? [];

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex h-14 items-center border-b border-[var(--intent-text-tertiary)] bg-white/95 px-4 backdrop-blur-md safe-top">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
          aria-label="Go back"
        >
          <ChevronLeft size={22} strokeWidth={1.5} className="text-[var(--intent-text-primary)]" />
        </button>
        <h1 className="ml-2 text-[16px] font-semibold text-[var(--intent-text-primary)]">
          Mentorship
        </h1>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pb-40 pt-6">
        {/* Mentor and mentee cards */}
        <div className="grid grid-cols-2 gap-3">
          <PersonCard user={mentorship.mentor} role="Mentor" />
          <PersonCard user={mentorship.mentee} role="Mentee" />
        </div>

        {/* Status, goal, cadence */}
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-[var(--card-shadow)]">
          <div className="flex items-center gap-2">
            <StatusBadge status={mentorship.status} />
            <span className="text-[13px] text-[var(--intent-text-secondary)]">
              {mentorship.sessionCount} session{mentorship.sessionCount !== 1 ? "s" : ""}
            </span>
          </div>

          {mentorship.goal && (
            <div className="mt-4 flex items-start gap-2">
              <Target size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--intent-amber)]" />
              <div>
                <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                  Goal
                </p>
                <p className="mt-0.5 text-[14px] text-[var(--intent-text-primary)]">
                  {mentorship.goal}
                </p>
              </div>
            </div>
          )}

          {mentorship.cadence && (
            <div className="mt-3 flex items-start gap-2">
              <Calendar size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[var(--intent-text-secondary)]" />
              <div>
                <p className="text-[12px] font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                  Cadence
                </p>
                <p className="mt-0.5 text-[14px] text-[var(--intent-text-primary)]">
                  {mentorship.cadence}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sessions */}
        <div className="mt-6">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
            Sessions
          </h3>
          {sessions.length === 0 ? (
            <div className="rounded-xl bg-[var(--muted)] p-4 text-center text-[13px] text-[var(--intent-text-secondary)]">
              No sessions recorded yet
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => {
                const isCompleted = !!session.completedAt;
                const dateStr = session.completedAt || session.scheduledAt;
                return (
                  <div
                    key={session.id}
                    className="flex items-start gap-3 rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-3"
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[var(--intent-green)]" />
                    ) : (
                      <Circle size={20} className="mt-0.5 shrink-0 text-[var(--intent-text-tertiary)]" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-[var(--intent-text-primary)]">
                        Session {session.sessionNumber}
                      </p>
                      {dateStr && (
                        <p className="text-[12px] text-[var(--intent-text-secondary)]">
                          {new Date(dateStr).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                      {session.notes && (
                        <p className="mt-1 text-[13px] text-[var(--intent-text-secondary)]">
                          {session.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky bottom action bar ────────────────────────────── */}
      {mentorship.conversationId && (
        <div
          className="fixed inset-x-0 bottom-16 z-30 border-t bg-white/95 backdrop-blur-md safe-bottom"
          style={{ borderColor: "var(--intent-text-tertiary)" }}
        >
          <div className="mx-auto max-w-[640px] px-4 py-3">
            <Button
              onClick={() => router.push(`/chats/${mentorship.conversationId}`)}
              className="h-12 w-full rounded-xl bg-[var(--intent-amber)] text-[15px] font-semibold text-white hover:bg-[var(--intent-amber-light)]"
            >
              <MessageCircle size={18} className="mr-2" />
              Open Chat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Person card                                                         */
/* ------------------------------------------------------------------ */

function PersonCard({ user, role }: { user: MentorshipUser; role: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4">
      <AvatarPlaceholder name={user.fullName} size={48} />
      <p className="text-center text-[14px] font-medium text-[var(--intent-text-primary)]">
        {user.fullName}
      </p>
      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
        <GraduationCap size={11} />
        {role}
      </span>
      {user.domain && (
        <p className="text-[12px] text-[var(--intent-text-secondary)]">
          {user.domain.displayName}
        </p>
      )}
    </div>
  );
}
