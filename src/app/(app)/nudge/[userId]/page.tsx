"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";
import { useSendNudge, useNudgeQuota } from "@/hooks/use-nudges";
import { SignalPill, type SignalPillData } from "@/components/signal-pill";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

const MAX_CHARS = 400;

// ── API response type ─────────────────────────────────────────────────

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

// ── Component ──────────────────────────────────────────────────────────

export default function NudgeComposerPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

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
  const matchingSignals: SignalPillData[] = (recipient?.openSignals ?? [])
    .map((s) => ({
      id: s.id,
      code: s.displayName.toLowerCase().replace(/\s+/g, "_"),
      displayName: s.displayName,
      signalType: s.signalType.toLowerCase() as
        | "ask"
        | "offer"
        | "mutual",
      icon: s.icon ?? undefined,
    }));

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
    selectedSignal !== null && message.trim().length > 0 && !sendNudge.isPending;
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
          router.push("/inbox");
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

  // ── Loading state ───────────────────────────────────────────────────

  if (recipientLoading) {
    return (
      <div className="bg-[#FAFAF6] flex flex-col min-h-screen items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-[640px] px-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E8E4DA]" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-[#E8E4DA] rounded w-40" />
              <div className="h-3 bg-[#E8E4DA] rounded w-56" />
            </div>
          </div>
          <div className="h-px bg-[#E8E4DA]" />
          <div className="h-4 bg-[#E8E4DA] rounded w-32" />
          <div className="flex gap-2">
            <div className="h-8 bg-[#E8E4DA] rounded-full w-36" />
            <div className="h-8 bg-[#E8E4DA] rounded-full w-28" />
          </div>
          <div className="h-px bg-[#E8E4DA]" />
          <div className="h-[200px] bg-[#E8E4DA] rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────

  if (recipientError || !recipient) {
    return (
      <div className="bg-[#FAFAF6] flex flex-col min-h-screen items-center justify-center px-4">
        <p className="text-sm text-[#6B6B66]">
          {recipientError instanceof Error
            ? recipientError.message
            : "Could not load this user."}
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 text-sm font-medium text-[#B8762A] hover:text-[#D4A053] transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF6] flex flex-col -mb-20">
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#FAFAF6]/95 backdrop-blur-sm border-b border-[#E8E4DA]">
        <div className="max-w-[640px] mx-auto flex items-center justify-between px-4 h-12">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-[#6B6B66] hover:text-[#1A1A1A] transition-colors"
          >
            Cancel
          </button>
          <h1 className="text-sm font-semibold text-[#1A1A1A]">Nudge</h1>
          <button
            type="button"
            onClick={handleSend}
            disabled={!isReady}
            className={cn(
              "text-sm font-semibold transition-colors",
              isReady
                ? "text-[#B8762A] hover:text-[#D4A053]"
                : "text-[#E8E4DA] cursor-not-allowed"
            )}
          >
            {sendNudge.isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-4 py-6 space-y-6">
          {/* Recipient row */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F2EFE8] shrink-0">
              {recipient.photoUrl ? (
                <img
                  src={recipient.photoUrl}
                  alt={recipient.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-medium text-[#6B6B66]">
                  {getInitials(recipient.fullName)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#1A1A1A] truncate">
                {recipient.fullName}
              </p>
              <p className="text-sm text-[#6B6B66] truncate">
                {[programLabel, recipient.profile?.currentCity]
                  .filter(Boolean)
                  .join(" \u00b7 ")}
              </p>
              {currentRole && (
                <p className="text-sm text-[#6B6B66] truncate">{currentRole}</p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E8E4DA]" />

          {/* Signal selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">
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
              <p className="text-sm text-[#6B6B66]">
                No matching signals found.
              </p>
            )}
            {matchingSignals.length > 0 && (
              <p className="text-xs text-[#6B6B66] leading-relaxed">
                We only show signals that match what{" "}
                <span className="font-medium text-[#1A1A1A]">{firstName}</span>{" "}
                is open to right now.
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E8E4DA]" />

          {/* Message composer */}
          <div className="space-y-2">
            <label
              htmlFor="nudge-message"
              className="text-sm font-semibold text-[#1A1A1A]"
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
                "w-full min-h-[200px] px-3.5 py-3 rounded-xl border border-[#E8E4DA] bg-white",
                "text-base text-[#1A1A1A] placeholder:text-[#6B6B66]/60",
                "resize-none outline-none transition-colors",
                "focus:border-[#B8762A] focus:ring-2 focus:ring-[#B8762A]/20"
              )}
            />
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-xs font-medium text-[#B8762A] hover:text-[#D4A053] transition-colors"
              >
                See examples
              </button>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  charCount > MAX_CHARS * 0.9
                    ? "text-[#D94141]"
                    : "text-[#6B6B66]"
                )}
              >
                {charCount} / {MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Send error */}
          {sendError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700">{sendError}</p>
            </div>
          )}

          {/* Cooldown info card */}
          <div className="rounded-xl bg-[#F5EDE0]/60 border-l-[3px] border-l-[#B8762A] p-4">
            <p className="text-sm text-[#6B6B66] leading-relaxed">
              If{" "}
              <span className="font-medium text-[#1A1A1A]">{firstName}</span>{" "}
              declines, you&apos;ll need to wait 90 days. If they don&apos;t
              respond, 30 days.
            </p>
          </div>

          {/* Spacer for sticky bottom + tab bar */}
          <div className="h-40" />
        </div>
      </main>

      {/* ── Sticky bottom bar (above tab bar) ────────────────────── */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-[#FAFAF6]/95 backdrop-blur-sm border-t border-[#E8E4DA] safe-bottom">
        <div className="max-w-[640px] mx-auto px-4 py-3 space-y-2">
          <button
            type="button"
            onClick={handleSend}
            disabled={!isReady}
            className={cn(
              "w-full h-12 rounded-xl text-base font-semibold transition-all duration-150",
              isReady
                ? "bg-[#B8762A] text-white hover:bg-[#D4A053] active:scale-[0.98]"
                : "bg-[#E8E4DA] text-[#6B6B66] cursor-not-allowed"
            )}
          >
            {sendNudge.isPending ? "Sending..." : "Send nudge"}
          </button>
          <p className="text-center text-xs text-[#6B6B66]">
            {quota ? (
              <>
                You have{" "}
                <span className="font-medium text-[#1A1A1A]">
                  {quota.remaining}
                </span>{" "}
                of{" "}
                <span className="font-medium text-[#1A1A1A]">
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
