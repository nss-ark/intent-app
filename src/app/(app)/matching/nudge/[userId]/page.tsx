"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";
import { useSendNudge, useNudgeQuota } from "@/hooks/use-nudges";
import { SignalPill, type SignalPillData } from "@/components/signal-pill";
import { cn, getInitials } from "@/lib/utils";

const MAX_CHARS = 400;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface RecipientUser {
  id: string;
  fullName: string;
  photoUrl: string | null;
  program: string | null;
  graduationYear: number | null;
  profile: {
    currentCity: string | null;
  } | null;
  experience: {
    id: string;
    title: string;
    companyName: string;
    isCurrent: boolean;
  }[];
  openSignals: {
    id: string;
    displayName: string;
    signalType: string;
    icon: string | null;
  }[];
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function NudgeComposerPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const router = useRouter();

  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  // Fetch recipient user data
  const {
    data: recipient,
    isLoading: recipientLoading,
    error: recipientError,
  } = useQuery<RecipientUser>({
    queryKey: ["user", userId],
    queryFn: () => apiFetch(`/api/users/${userId}`),
    enabled: !!userId,
  });

  // Fetch nudge quota
  const { data: quota } = useNudgeQuota();

  // Send nudge mutation
  const sendNudge = useSendNudge();

  // Map open signals to SignalPillData format
  const matchingSignals: SignalPillData[] = (recipient?.openSignals ?? []).map(
    (s) => ({
      id: s.id,
      code: s.displayName.toLowerCase().replace(/\s+/g, "_"),
      displayName: s.displayName,
      signalType: s.signalType.toLowerCase() as "ask" | "offer" | "mutual",
      icon: s.icon ?? undefined,
    })
  );

  // Build display strings
  const currentExp = recipient?.experience.find((e) => e.isCurrent);
  const currentRole = currentExp
    ? currentExp.companyName
      ? `${currentExp.title} at ${currentExp.companyName}`
      : currentExp.title
    : null;
  const programLabel = [
    recipient?.program,
    recipient?.graduationYear ? `Class of ${recipient.graduationYear}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const isReady =
    selectedSignal !== null &&
    message.trim().length > 0 &&
    !sendNudge.isPending;
  const charCount = message.length;

  const handleSignalClick = (signal: SignalPillData) => {
    setSelectedSignal((prev) => (prev === signal.id ? null : signal.id));
  };

  const handleSend = () => {
    if (!isReady || !selectedSignal) return;
    setSendError(null);
    sendNudge.mutate(
      { receiverUserId: userId, message, signalIds: [selectedSignal] },
      {
        onSuccess: () => {
          router.push("/matching");
        },
        onError: (err) => {
          setSendError(
            err instanceof Error ? err.message : "Failed to send nudge"
          );
        },
      }
    );
  };

  const firstName = recipient?.fullName.split(" ")[0] ?? "";

  /* ── Loading ──────────────────────────────────────────────────── */

  if (recipientLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--intent-bg)]">
        <div className="w-full max-w-[640px] animate-pulse space-y-4 px-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[var(--intent-text-tertiary)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-[var(--intent-text-tertiary)]" />
              <div className="h-3 w-56 rounded bg-[var(--intent-text-tertiary)]" />
            </div>
          </div>
          <div className="h-px bg-[var(--intent-text-tertiary)]" />
          <div className="h-4 w-32 rounded bg-[var(--intent-text-tertiary)]" />
          <div className="flex gap-2">
            <div className="h-8 w-36 rounded-full bg-[var(--intent-text-tertiary)]" />
            <div className="h-8 w-28 rounded-full bg-[var(--intent-text-tertiary)]" />
          </div>
          <div className="h-px bg-[var(--intent-text-tertiary)]" />
          <div className="h-[200px] rounded-xl bg-[var(--intent-text-tertiary)]" />
        </div>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────────────── */

  if (recipientError || !recipient) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--intent-bg)] px-4">
        <p className="text-sm text-[var(--intent-text-secondary)]">
          {recipientError instanceof Error
            ? recipientError.message
            : "Could not load this user."}
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-sm font-medium text-[var(--intent-navy)] transition-colors hover:text-[var(--intent-navy-light)]"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="-mb-20 flex flex-col bg-[var(--intent-bg)]">
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-[640px] items-center justify-between px-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-[var(--intent-text-secondary)] transition-colors hover:text-[var(--intent-text-primary)]"
          >
            Cancel
          </button>
          <h1 className="text-sm font-semibold text-[var(--intent-text-primary)]">
            Nudge
          </h1>
          <button
            type="button"
            onClick={handleSend}
            disabled={!isReady}
            className={cn(
              "text-sm font-semibold transition-colors",
              isReady
                ? "text-[var(--intent-navy)] hover:text-[var(--intent-navy-light)]"
                : "cursor-not-allowed text-[var(--intent-text-tertiary)]"
            )}
          >
            {sendNudge.isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[640px] space-y-6 px-4 py-6">
          {/* Recipient row */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--muted)]">
              {recipient.photoUrl ? (
                <img
                  src={recipient.photoUrl}
                  alt={recipient.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[var(--intent-text-secondary)]">
                  {getInitials(recipient.fullName)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-[var(--intent-text-primary)]">
                {recipient.fullName}
              </p>
              <p className="truncate text-sm text-[var(--intent-text-secondary)]">
                {[programLabel, recipient.profile?.currentCity]
                  .filter(Boolean)
                  .join(" \u00b7 ")}
              </p>
              {currentRole && (
                <p className="truncate text-sm text-[var(--intent-text-secondary)]">
                  {currentRole}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--intent-text-tertiary)]" />

          {/* Signal selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--intent-text-primary)]">
              What&apos;s this about?
            </h2>
            {matchingSignals.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchingSignals.map((signal) => (
                  <SignalPill
                    key={signal.id}
                    signal={signal}
                    isSelected={selectedSignal === signal.id}
                    onClick={handleSignalClick}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--intent-text-secondary)]">
                No matching signals found.
              </p>
            )}
            {matchingSignals.length > 0 && (
              <p className="text-xs leading-relaxed text-[var(--intent-text-secondary)]">
                We only show signals that match what{" "}
                <span className="font-medium text-[var(--intent-text-primary)]">
                  {firstName}
                </span>{" "}
                is open to right now.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[var(--intent-text-tertiary)]" />

          {/* Message composer */}
          <div className="space-y-2">
            <label
              htmlFor="nudge-message"
              className="text-sm font-semibold text-[var(--intent-text-primary)]"
            >
              Your message
            </label>
            <textarea
              id="nudge-message"
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setMessage(e.target.value);
                }
              }}
              placeholder={`Be specific. What's the ask? Why ${firstName} specifically?`}
              className={cn(
                "w-full min-h-[200px] rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-3.5 py-3",
                "text-base text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)]/60",
                "resize-none outline-none transition-colors",
                "focus:border-[var(--intent-navy)] focus:ring-2 focus:ring-[var(--intent-navy)]/20"
              )}
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-xs font-medium text-[var(--intent-navy)] transition-colors hover:text-[var(--intent-navy-light)]"
              >
                See examples
              </button>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  charCount > MAX_CHARS * 0.9
                    ? "text-[var(--intent-destructive)]"
                    : "text-[var(--intent-text-secondary)]"
                )}
              >
                {charCount} / {MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Send error */}
          {sendError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{sendError}</p>
            </div>
          )}

          {/* Cooldown info card */}
          <div className="rounded-xl border-l-[3px] border-l-[var(--intent-navy)] bg-[var(--intent-navy-subtle)]/60 p-4">
            <p className="text-sm leading-relaxed text-[var(--intent-text-secondary)]">
              If{" "}
              <span className="font-medium text-[var(--intent-text-primary)]">
                {firstName}
              </span>{" "}
              declines, you&apos;ll need to wait 90 days. If they don&apos;t
              respond, 30 days.
            </p>
          </div>

          {/* Spacer for sticky bottom + tab bar */}
          <div className="h-40" />
        </div>
      </main>

      {/* ── Sticky bottom bar (above tab bar) ────────────────────── */}
      <div className="fixed inset-x-0 bottom-16 z-40 border-t border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)]/95 backdrop-blur-sm safe-bottom">
        <div className="mx-auto max-w-[640px] space-y-2 px-4 py-3">
          <button
            type="button"
            onClick={handleSend}
            disabled={!isReady}
            className={cn(
              "h-12 w-full rounded-xl text-base font-semibold transition-all duration-150",
              isReady
                ? "bg-[var(--intent-navy)] text-white hover:bg-[var(--intent-navy-light)] active:scale-[0.98]"
                : "cursor-not-allowed bg-[var(--intent-text-tertiary)] text-[var(--intent-text-secondary)]"
            )}
          >
            {sendNudge.isPending ? "Sending..." : "Send nudge"}
          </button>
          <p className="text-center text-xs text-[var(--intent-text-secondary)]">
            {quota ? (
              <>
                You have{" "}
                <span className="font-medium text-[var(--intent-text-primary)]">
                  {quota.remaining}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[var(--intent-text-primary)]">
                  {quota.limit}
                </span>{" "}
                nudges remaining this week.
              </>
            ) : (
              "\u00a0"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
