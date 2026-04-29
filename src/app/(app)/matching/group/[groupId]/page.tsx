"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  Users,
  MessageCircle,
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

interface GroupMember {
  id: string;
  userId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  user: {
    id: string;
    fullName: string;
    photoUrl: string | null;
  };
}

interface GroupMatchDetail {
  id: string;
  status: "PENDING" | "NOTIFIED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  memberCount: number;
  conversationId: string | null;
  niches: { id: string; displayName: string }[];
  members: GroupMember[];
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Member status badge                                                 */
/* ------------------------------------------------------------------ */

function MemberStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    ACCEPTED: { bg: "bg-[var(--intent-green-subtle)]", text: "text-[var(--intent-green)]", label: "Accepted" },
    PENDING: { bg: "bg-[var(--intent-amber-subtle)]", text: "text-[var(--intent-amber)]", label: "Pending" },
    DECLINED: { bg: "bg-red-50", text: "text-[var(--intent-destructive)]", label: "Declined" },
  };
  const c = config[status] ?? config.PENDING;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", c.bg, c.text)}>
      {c.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function GroupMatchDetailPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = use(params);
  const router = useRouter();
  const qc = useQueryClient();

  // Fetch current user
  const { data: me } = useQuery<{ id: string }>({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/users/me"),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch group match detail
  const {
    data: group,
    isLoading,
    isError,
  } = useQuery<GroupMatchDetail>({
    queryKey: ["group-match", groupId],
    queryFn: () => apiFetch(`/api/group-matches/${groupId}`),
    enabled: !!groupId,
  });

  // Accept / decline mutation
  const action = useMutation({
    mutationFn: (act: "ACCEPTED" | "DECLINED") =>
      apiFetch(`/api/group-matches/${groupId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: act }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group-match", groupId] });
      qc.invalidateQueries({ queryKey: ["group-matches"] });
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

  if (isError || !group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--intent-bg)]">
        <p className="text-[var(--intent-text-secondary)]">Group match not found</p>
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

  const isPending = group.status === "PENDING" || group.status === "NOTIFIED";
  const myMembership = group.members.find((m) => m.userId === me?.id);
  const needsAction = isPending && myMembership && myMembership.status !== "ACCEPTED";
  const isActive = group.status === "ACTIVE";

  // Group status badge
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    ACTIVE: { bg: "bg-[var(--intent-green-subtle)]", text: "text-[var(--intent-green)]", label: "Active" },
    PENDING: { bg: "bg-[var(--intent-amber-subtle)]", text: "text-[var(--intent-amber)]", label: "Pending" },
    NOTIFIED: { bg: "bg-[var(--intent-amber-subtle)]", text: "text-[var(--intent-amber)]", label: "Pending" },
    COMPLETED: { bg: "bg-[var(--muted)]", text: "text-[var(--intent-text-secondary)]", label: "Completed" },
    CANCELLED: { bg: "bg-[var(--muted)]", text: "text-[var(--intent-text-secondary)]", label: "Cancelled" },
  };
  const sc = statusConfig[group.status] ?? statusConfig.PENDING;

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
          Group Match
        </h1>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pb-40 pt-6">
        {/* Group info */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--card-shadow)]">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--intent-amber-subtle)]">
              <Users size={24} className="text-[var(--intent-amber)]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-[18px] font-bold text-[var(--intent-text-primary)]">
                {group.niches.map((n) => n.displayName).join(", ") || "Group Match"}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[13px] text-[var(--intent-text-secondary)]">
                  {group.memberCount} members
                </span>
                <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", sc.bg, sc.text)}>
                  {sc.label}
                </span>
              </div>
            </div>
          </div>

          {/* Niche pills */}
          {group.niches.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {group.niches.map((n) => (
                <span
                  key={n.id}
                  className="rounded-full bg-[var(--intent-amber-subtle)] px-3 py-1 text-[12px] font-medium text-[var(--intent-amber)]"
                >
                  {n.displayName}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Member grid */}
        <div className="mt-6">
          <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
            Members
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4"
              >
                <AvatarPlaceholder name={member.user.fullName} size={48} />
                <p className="text-center text-[14px] font-medium text-[var(--intent-text-primary)]">
                  {member.user.fullName}
                </p>
                <MemberStatusBadge status={member.status} />
              </div>
            ))}
          </div>
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

          {isActive && group.conversationId && (
            <Button
              onClick={() => router.push(`/chats/${group.conversationId}`)}
              className="h-12 w-full rounded-xl bg-[var(--intent-amber)] text-[15px] font-semibold text-white hover:bg-[var(--intent-amber-light)]"
            >
              <MessageCircle size={18} className="mr-2" />
              Open Group Chat
            </Button>
          )}

          {!needsAction && !isActive && (
            <div className="flex h-12 items-center justify-center rounded-xl bg-[var(--muted)] text-[14px] text-[var(--intent-text-secondary)]">
              This group match is {group.status.toLowerCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
