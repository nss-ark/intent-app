"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Briefcase,
  Handshake,
  GraduationCap,
  MessageCircle,
  Clock,
  Check,
  X,
} from "lucide-react";
import { apiFetch } from "@/hooks/use-api";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface MatchUser {
  id: string;
  fullName: string;
  photoUrl: string | null;
  profile: {
    missionStatement: string | null;
    currentCity: string | null;
    currentCountry: string | null;
  } | null;
  domain: { id: string; displayName: string } | null;
}

interface MatchDetail {
  id: string;
  matchType: "ONE_ON_ONE" | "MENTORSHIP";
  status: "PENDING" | "NOTIFIED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "DECLINED";
  matchScore: number | null;
  matchReason: string | null;
  conversationId: string | null;
  userAId: string;
  userBId: string;
  userAStatus: string;
  userBStatus: string;
  userA: MatchUser;
  userB: MatchUser;
  niches: { id: string; displayName: string }[];
  signals: { id: string; displayName: string; signalType: string }[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = use(params);
  const router = useRouter();
  const qc = useQueryClient();

  // Fetch current user for ID
  const { data: me } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/users/me"),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch match detail
  const {
    data: match,
    isLoading,
    isError,
  } = useQuery<MatchDetail>({
    queryKey: ["match", matchId],
    queryFn: () => apiFetch(`/api/matches/${matchId}`),
    enabled: !!matchId,
  });

  // Accept / decline mutation
  const action = useMutation({
    mutationFn: (act: "ACCEPTED" | "DECLINED") =>
      apiFetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: act }),
      }),
    onSuccess: (data: MatchDetail | { conversationId?: string; status?: string } | unknown) => {
      qc.invalidateQueries({ queryKey: ["match", matchId] });
      qc.invalidateQueries({ queryKey: ["matches"] });
      // If both accepted and match becomes active, redirect to chat
      const result = data as { conversationId?: string; status?: string } | undefined;
      if (result?.conversationId) {
        router.push(`/chats/${result.conversationId}`);
      }
    },
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

  if (isError || !match) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--intent-bg)]">
        <p className="text-[var(--intent-text-secondary)]">Match not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/matching")}
          className="rounded-xl"
        >
          Back to matching
        </Button>
      </div>
    );
  }

  /* ── Derived values ───────────────────────────────────────────── */

  const isUserA = me?.id === match.userAId;
  const other = isUserA ? match.userB : match.userA;
  const myStatus = isUserA ? match.userAStatus : match.userBStatus;
  const otherStatus = isUserA ? match.userBStatus : match.userAStatus;

  const location = [other.profile?.currentCity, other.profile?.currentCountry]
    .filter(Boolean)
    .join(", ");

  const isPending = match.status === "PENDING" || match.status === "NOTIFIED";
  const needsAction = isPending && myStatus !== "ACCEPTED";
  const waitingOnOther = isPending && myStatus === "ACCEPTED" && otherStatus !== "ACCEPTED";
  const isActive = match.status === "ACTIVE";

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
          Match Detail
        </h1>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pb-40 pt-6">
        {/* Profile card */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--card-shadow)]">
          <div className="flex flex-col items-center">
            <AvatarPlaceholder name={other.fullName} size={80} />
            <h2 className="mt-4 text-[22px] font-bold text-[var(--intent-text-primary)]">
              {other.fullName}
            </h2>
            {other.profile?.missionStatement && (
              <p className="mt-2 text-center text-[14px] italic leading-relaxed text-[var(--intent-text-secondary)]">
                &ldquo;{other.profile.missionStatement}&rdquo;
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              {other.domain && (
                <span className="flex items-center gap-1 text-[13px] text-[var(--intent-text-secondary)]">
                  <Briefcase size={14} />
                  {other.domain.displayName}
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1 text-[13px] text-[var(--intent-text-secondary)]">
                  <MapPin size={14} />
                  {location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Match type + score */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-[12px] font-medium",
              match.matchType === "MENTORSHIP"
                ? "bg-purple-50 text-purple-700"
                : "bg-[var(--intent-amber-subtle)] text-[var(--intent-amber)]"
            )}
          >
            {match.matchType === "MENTORSHIP" ? (
              <GraduationCap size={13} />
            ) : (
              <Handshake size={13} />
            )}
            {match.matchType === "MENTORSHIP" ? "Mentorship" : "1:1 Match"}
          </span>
          {match.matchScore !== null && (
            <span className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--intent-text-secondary)]">
              {Math.round(match.matchScore * 100)}% match
            </span>
          )}
        </div>

        {/* Why you matched */}
        <div className="mt-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
            Why you matched
          </h3>
          {match.matchReason && (
            <p className="mt-2 text-[14px] leading-relaxed text-[var(--intent-text-primary)]">
              {match.matchReason}
            </p>
          )}

          {/* Shared niches */}
          {match.niches.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[12px] font-medium text-[var(--intent-text-secondary)]">
                Shared niches
              </p>
              <div className="flex flex-wrap gap-2">
                {match.niches.map((n) => (
                  <span
                    key={n.id}
                    className="rounded-full bg-[var(--intent-amber-subtle)] px-3 py-1 text-[12px] font-medium text-[var(--intent-amber)]"
                  >
                    {n.displayName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Complementary signals */}
          {match.signals && match.signals.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[12px] font-medium text-[var(--intent-text-secondary)]">
                Complementary signals
              </p>
              <div className="flex flex-wrap gap-2">
                {match.signals.map((s) => (
                  <span
                    key={s.id}
                    className={cn(
                      "rounded-full px-3 py-1 text-[12px] font-medium",
                      s.signalType === "ASK"
                        ? "bg-[var(--intent-amber-subtle)] text-[var(--intent-amber)]"
                        : s.signalType === "OFFER"
                        ? "bg-[var(--intent-green-subtle)] text-[var(--intent-green)]"
                        : "bg-[var(--muted)] text-[var(--intent-text-secondary)]"
                    )}
                  >
                    {s.displayName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky bottom action bar ────────────────────────────── */}
      <div
        className="fixed inset-x-0 bottom-16 z-30 border-t bg-white/95 backdrop-blur-md safe-bottom"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto max-w-[640px] px-4 py-3">
          {needsAction && (
            <div className="flex gap-3">
              <Button
                onClick={() => action.mutate("ACCEPTED")}
                disabled={action.isPending}
                className="h-12 flex-1 rounded-xl bg-[var(--intent-amber)] text-[15px] font-semibold text-white hover:bg-[var(--intent-amber-light)]"
              >
                <Check size={18} className="mr-2" />
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => action.mutate("DECLINED")}
                disabled={action.isPending}
                className="h-12 flex-1 rounded-xl border-[var(--intent-text-tertiary)] text-[15px] font-medium"
              >
                <X size={18} className="mr-2" />
                Decline
              </Button>
            </div>
          )}

          {waitingOnOther && (
            <div className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--muted)] text-[15px] font-medium text-[var(--intent-text-secondary)]">
              <Clock size={18} />
              Waiting for response...
            </div>
          )}

          {isActive && match.conversationId && (
            <Button
              onClick={() => router.push(`/chats/${match.conversationId}`)}
              className="h-12 w-full rounded-xl bg-[var(--intent-amber)] text-[15px] font-semibold text-white hover:bg-[var(--intent-amber-light)]"
            >
              <MessageCircle size={18} className="mr-2" />
              Open Chat
            </Button>
          )}

          {!needsAction && !waitingOnOther && !isActive && (
            <div className="flex h-12 items-center justify-center rounded-xl bg-[var(--muted)] text-[14px] text-[var(--intent-text-secondary)]">
              This match is {match.status.toLowerCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
