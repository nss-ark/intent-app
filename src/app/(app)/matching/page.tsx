"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Loader2,
  Handshake,
  Users,
  GraduationCap,
  ChevronRight,
  Check,
  X,
  Inbox,
} from "lucide-react";
import { apiFetch } from "@/hooks/use-api";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface MatchUser {
  id: string;
  fullName: string;
  photoUrl: string | null;
}

interface MatchItem {
  id: string;
  matchType: "ONE_TO_ONE" | "MENTORSHIP";
  status: "PENDING" | "NOTIFIED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "DECLINED";
  matchScore: number | null;
  matchReason: string | null;
  conversationId: string | null;
  myStatus: string;
  userAStatus: string;
  userBStatus: string;
  otherUser: MatchUser;
  createdAt: string;
}

interface GroupMatchMember {
  userId: string;
  status: string;
  user: MatchUser;
}

interface GroupMatchItem {
  id: string;
  status: "PENDING" | "NOTIFIED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  memberCount: number;
  niches: { id: string; displayName: string }[];
  members: GroupMatchMember[];
  createdAt: string;
}

interface MentorshipCount {
  total: number;
}

/* ------------------------------------------------------------------ */
/* Status badge                                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: "bg-[var(--intent-green-subtle)]", text: "text-[var(--intent-green)]", label: "Active" },
    PENDING: { bg: "bg-[var(--intent-amber-subtle)]", text: "text-[var(--intent-amber)]", label: "Pending" },
    NOTIFIED: { bg: "bg-[var(--intent-amber-subtle)]", text: "text-[var(--intent-amber)]", label: "Pending" },
    COMPLETED: { bg: "bg-[var(--muted)]", text: "text-[var(--intent-text-secondary)]", label: "Completed" },
    CANCELLED: { bg: "bg-[var(--muted)]", text: "text-[var(--intent-text-secondary)]", label: "Cancelled" },
    DECLINED: { bg: "bg-red-50", text: "text-[var(--intent-destructive)]", label: "Declined" },
  };
  const c = config[status] ?? config.PENDING;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", c.bg, c.text)}>
      {c.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Match type badge                                                    */
/* ------------------------------------------------------------------ */

function TypeBadge({ type }: { type: "ONE_TO_ONE" | "MENTORSHIP" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        type === "MENTORSHIP"
          ? "bg-purple-50 text-purple-700"
          : "bg-[var(--intent-amber-subtle)] text-[var(--intent-amber)]"
      )}
    >
      {type === "MENTORSHIP" ? <GraduationCap size={11} /> : <Handshake size={11} />}
      {type === "MENTORSHIP" ? "Mentorship" : "1:1"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 1:1 Match card                                                      */
/* ------------------------------------------------------------------ */

function MatchCard({
  match,
  onAccept,
  onDecline,
  isActioning,
}: {
  match: MatchItem;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isActioning: boolean;
}) {
  const router = useRouter();
  const other = match.otherUser;
  const isPending = match.status === "PENDING" || match.status === "NOTIFIED";
  const needsAction = isPending && match.myStatus !== "ACCEPTED";

  return (
    <div
      className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4 transition-shadow hover:shadow-[var(--card-shadow)]"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/matching/1-on-1/${match.id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/matching/1-on-1/${match.id}`)}
    >
      <div className="flex items-start gap-3">
        <AvatarPlaceholder name={other.fullName} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-[var(--intent-text-primary)]">
              {other.fullName}
            </p>
            <StatusBadge status={match.status} />
          </div>
          {match.matchReason && (
            <p className="mt-0.5 truncate text-[13px] text-[var(--intent-text-secondary)]">
              {match.matchReason}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <TypeBadge type={match.matchType} />
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className="mt-1 shrink-0 text-[var(--intent-text-secondary)]" />
      </div>

      {/* Action buttons */}
      {needsAction && (
        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onAccept(match.id)}
            disabled={isActioning}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--intent-amber)] text-[13px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)] disabled:opacity-50"
          >
            <Check size={14} />
            Accept
          </button>
          <button
            onClick={() => onDecline(match.id)}
            disabled={isActioning}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--intent-text-tertiary)] text-[13px] font-medium text-[var(--intent-text-primary)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
          >
            <X size={14} />
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Group match card                                                    */
/* ------------------------------------------------------------------ */

function GroupMatchCard({
  group,
  currentUserId,
  onAccept,
  onDecline,
  isActioning,
}: {
  group: GroupMatchItem;
  currentUserId: string | undefined;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isActioning: boolean;
}) {
  const router = useRouter();
  const isPending = group.status === "PENDING" || group.status === "NOTIFIED";
  const myMembership = group.members.find((m) => m.userId === currentUserId);
  const needsAction = isPending && myMembership && myMembership.status !== "ACCEPTED";
  const displayMembers = group.members.slice(0, 4);

  return (
    <div
      className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4 transition-shadow hover:shadow-[var(--card-shadow)]"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/matching/group/${group.id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/matching/group/${group.id}`)}
    >
      <div className="flex items-start gap-3">
        {/* Stacked avatars */}
        <div className="flex -space-x-2">
          {displayMembers.map((m) => (
            <AvatarPlaceholder
              key={m.userId}
              name={m.user.fullName}
              size={32}
              className="ring-2 ring-white"
            />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-[var(--intent-text-primary)]">
              {group.niches.map((n) => n.displayName).join(", ") || "Group Match"}
            </p>
            <StatusBadge status={group.status} />
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="flex items-center gap-1 text-[13px] text-[var(--intent-text-secondary)]">
              <Users size={13} />
              {group.memberCount} members
            </span>
          </div>
        </div>
        <ChevronRight size={18} strokeWidth={1.5} className="mt-1 shrink-0 text-[var(--intent-text-secondary)]" />
      </div>

      {/* Action buttons */}
      {needsAction && (
        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onAccept(group.id)}
            disabled={isActioning}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--intent-amber)] text-[13px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)] disabled:opacity-50"
          >
            <Check size={14} />
            Accept
          </button>
          <button
            onClick={() => onDecline(group.id)}
            disabled={isActioning}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--intent-text-tertiary)] text-[13px] font-medium text-[var(--intent-text-primary)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
          >
            <X size={14} />
            Decline
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton loader                                                     */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-[var(--intent-text-tertiary)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-[var(--intent-text-tertiary)]" />
          <div className="h-3 w-48 rounded bg-[var(--intent-text-tertiary)]" />
          <div className="flex gap-2">
            <div className="h-5 w-12 rounded-full bg-[var(--intent-text-tertiary)]" />
            <div className="h-5 w-20 rounded-full bg-[var(--intent-text-tertiary)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function MatchingPage() {
  const [tab, setTab] = useState<"active" | "history">("active");
  const qc = useQueryClient();

  // Fetch current user for ID
  const { data: me } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/users/me"),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch 1:1 matches
  const {
    data: matchesData,
    isLoading: matchesLoading,
  } = useQuery<{ items: MatchItem[] }>({
    queryKey: ["matches", tab],
    queryFn: () => apiFetch(`/api/matches?tab=${tab}`),
  });

  // Fetch group matches
  const activeGroupStatuses = "PENDING,NOTIFIED,ACTIVE";
  const historyGroupStatuses = "COMPLETED,CANCELLED";
  const {
    data: groupMatchesData,
    isLoading: groupMatchesLoading,
  } = useQuery<{ items: GroupMatchItem[] }>({
    queryKey: ["group-matches", tab],
    queryFn: () =>
      apiFetch(
        `/api/group-matches?status=${tab === "active" ? activeGroupStatuses : historyGroupStatuses}`
      ),
  });

  // Fetch mentorship count
  const { data: mentorshipsData } = useQuery<{ items: unknown[]; total: number }>({
    queryKey: ["mentorship-count"],
    queryFn: () => apiFetch("/api/mentorships?status=ACTIVE&pageSize=1"),
  });

  // Accept / decline 1:1 match
  const matchAction = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "ACCEPTED" | "DECLINED" }) =>
      apiFetch(`/api/matches/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["group-matches"] });
    },
  });

  // Accept / decline group match
  const groupMatchAction = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "ACCEPTED" | "DECLINED" }) =>
      apiFetch(`/api/group-matches/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-matches"] });
    },
  });

  const isLoading = matchesLoading || groupMatchesLoading;
  const allMatches = matchesData?.items ?? [];
  const allGroupMatches = groupMatchesData?.items ?? [];
  const isEmpty = allMatches.length === 0 && allGroupMatches.length === 0;
  const mentorships = mentorshipsData?.total ?? 0;

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--intent-text-primary)]">
            Matching
          </h1>
          <Link
            href="/matching/directory"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
            aria-label="Find people"
          >
            <Search
              size={22}
              strokeWidth={1.5}
              className="text-[var(--intent-text-primary)]"
            />
          </Link>
        </div>

        {/* Mentorship banner */}
        {mentorships > 0 && (
          <Link
            href="/matching/mentorship"
            className="mt-4 flex items-center justify-between rounded-xl border border-[var(--intent-text-tertiary)] bg-purple-50 p-3 transition-colors hover:bg-purple-100"
          >
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-purple-700" />
              <span className="text-[14px] font-medium text-purple-700">
                Active Mentorships ({mentorships})
              </span>
            </div>
            <ChevronRight size={16} className="text-purple-500" />
          </Link>
        )}

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div className="mt-4 flex gap-1 rounded-xl bg-[var(--muted)] p-1">
          {(["active", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-2 text-[14px] font-medium transition-all",
                tab === t
                  ? "bg-white text-[var(--intent-text-primary)] shadow-sm"
                  : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
              )}
            >
              {t === "active" ? "Active" : "History"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 py-4 pb-32">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
              <Inbox size={28} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
            </div>
            <p className="mt-4 text-[15px] font-medium text-[var(--intent-text-primary)]">
              {tab === "active" ? "No active matches yet" : "No match history"}
            </p>
            <p className="mt-1 text-center text-[13px] text-[var(--intent-text-secondary)]">
              {tab === "active"
                ? "When the matching engine pairs you with someone, your matches will appear here."
                : "Your completed and cancelled matches will show up here."}
            </p>
            {tab === "active" && (
              <Link
                href="/matching/directory"
                className="mt-4 rounded-xl bg-[var(--intent-amber)] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)]"
              >
                Browse directory
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* 1:1 matches */}
            {allMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onAccept={(id) => matchAction.mutate({ id, action: "ACCEPTED" })}
                onDecline={(id) => matchAction.mutate({ id, action: "DECLINED" })}
                isActioning={matchAction.isPending}
              />
            ))}

            {/* Group matches */}
            {allGroupMatches.map((group) => (
              <GroupMatchCard
                key={group.id}
                group={group}
                currentUserId={me?.id}
                onAccept={(id) => groupMatchAction.mutate({ id, action: "ACCEPTED" })}
                onDecline={(id) => groupMatchAction.mutate({ id, action: "DECLINED" })}
                isActioning={groupMatchAction.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
