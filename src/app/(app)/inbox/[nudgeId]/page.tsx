"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNudgeDetail, useRespondNudge } from "@/hooks/use-nudges";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

// ── Component ──────────────────────────────────────────────────────────

export default function NudgeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const nudgeId = params.nudgeId as string;

  const [showMenu, setShowMenu] = useState(false);

  const { data: nudge, isLoading, isError, refetch } = useNudgeDetail(nudgeId);
  const respond = useRespondNudge();

  const senderName = nudge?.sender.fullName ?? "";
  const senderFirstName = senderName.split(" ")[0];
  const senderPhotoUrl = nudge?.sender.photoUrl ?? null;
  const signalLabel =
    nudge?.signals[0]?.tenantSignal?.template?.displayNameDefault ?? "";
  const missionStatement = nudge?.sender.profile?.missionStatement ?? null;

  const isPending = nudge?.status === "SENT";

  const handleAccept = () => {
    respond.mutate(
      { id: nudgeId, status: "ACCEPTED" },
      { onSuccess: () => router.push("/inbox") }
    );
  };

  const handleDecline = () => {
    respond.mutate(
      { id: nudgeId, status: "DECLINED" },
      { onSuccess: () => router.push("/inbox") }
    );
  };

  const handleIgnore = () => {
    router.push("/inbox");
  };

  // ── Loading state ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-[#FAFAF6] flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)]">
        <Loader2 size={32} className="animate-spin text-[#B8762A]" />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (isError || !nudge) {
    return (
      <div className="bg-[#FAFAF6] flex flex-col items-center justify-center min-h-[calc(100dvh-5rem)] px-4">
        <p className="text-sm text-[#D94141] mb-2">Failed to load nudge</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm font-medium text-[#B8762A] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAF6] flex flex-col -mb-20">
      {/* ── Top Bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#FAFAF6]/95 backdrop-blur-sm border-b border-[#E8E4DA]">
        <div className="max-w-[640px] mx-auto flex items-center justify-between px-4 h-12">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center -ml-2 rounded-lg text-[#1A1A1A] hover:bg-[#F2EFE8] transition-colors"
            aria-label="Go back"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <h1 className="text-sm font-semibold text-[#1A1A1A]">Nudge</h1>

          {/* Overflow menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 flex items-center justify-center -mr-2 rounded-lg text-[#6B6B66] hover:bg-[#F2EFE8] transition-colors"
              aria-label="More options"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white rounded-xl shadow-lg border border-[#E8E4DA] py-1.5 overflow-hidden">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F2EFE8] transition-colors"
                    onClick={() => {
                      setShowMenu(false);
                      router.push(`/profile/${nudge.sender.id}`);
                    }}
                  >
                    View profile
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F2EFE8] transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    Report this nudge
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm text-[#D94141] hover:bg-[#F2EFE8] transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    Block user
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-4 py-6 space-y-5">
          {/* Sender card */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F2EFE8] shrink-0">
              {senderPhotoUrl ? (
                <img
                  src={senderPhotoUrl}
                  alt={senderName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-medium text-[#6B6B66]">
                  {getInitials(senderName)}
                </div>
              )}
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">
                {senderName}
              </h2>
              {missionStatement && (
                <p className="text-sm text-[#6B6B66] mt-0.5">
                  {missionStatement}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E8E4DA]" />

          {/* Signal indicator card */}
          {signalLabel && (
            <div className="rounded-xl bg-[#F5EDE0]/60 p-4">
              <p className="text-sm text-[#6B6B66] mb-1">
                <span className="font-medium text-[#1A1A1A]">
                  {senderFirstName}
                </span>{" "}
                is asking
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[#B8762A]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                </span>
                <span className="text-base font-semibold text-[#1A1A1A]">
                  {signalLabel}
                </span>
              </div>

              {/* Additional signals */}
              {nudge.signals.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {nudge.signals.slice(1).map((s) => (
                    <span
                      key={s.tenantSignal.id}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F2EFE8] text-[#6B6B66]"
                    >
                      {s.tenantSignal.template.displayNameDefault}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full message body */}
          <div className="space-y-3">
            {nudge.message && (
              <p className="text-base text-[#1A1A1A] leading-relaxed whitespace-pre-line">
                {nudge.message}
              </p>
            )}
            <p className="text-xs text-[#6B6B66]">
              Sent{" "}
              {formatDistanceToNow(new Date(nudge.sentAt), {
                addSuffix: true,
              })}
            </p>
          </div>

          {/* Status badge for already-responded nudges */}
          {!isPending && (
            <div
              className={cn(
                "rounded-xl p-4 text-sm font-medium",
                nudge.status === "ACCEPTED"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              )}
            >
              {nudge.status === "ACCEPTED"
                ? "You accepted this nudge."
                : "You declined this nudge."}
              {nudge.respondedAt && (
                <span className="ml-1 font-normal text-xs opacity-70">
                  (
                  {formatDistanceToNow(new Date(nudge.respondedAt), {
                    addSuffix: true,
                  })}
                  )
                </span>
              )}
            </div>
          )}

          {/* Cooldown notice card — only show for pending nudges */}
          {isPending && (
            <div className="rounded-xl bg-[#F5EDE0]/60 border-l-[3px] border-l-[#B8762A] p-4">
              <p className="text-sm text-[#6B6B66] leading-relaxed">
                If you decline,{" "}
                <span className="font-medium text-[#1A1A1A]">
                  {senderFirstName}
                </span>{" "}
                won&apos;t be able to nudge you again for 90 days. If you
                ignore, the nudge expires in 14 days.
              </p>
            </div>
          )}

          {/* Spacer for sticky bottom + tab bar */}
          <div className="h-44" />
        </div>
      </main>

      {/* ── Sticky bottom action bar (above tab bar) ──────────────── */}
      {isPending && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-[#FAFAF6]/95 backdrop-blur-sm border-t border-[#E8E4DA] safe-bottom">
          <div className="max-w-[640px] mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Decline - 30% */}
              <button
                type="button"
                onClick={handleDecline}
                disabled={respond.isPending}
                className={cn(
                  "h-12 rounded-xl text-sm font-semibold transition-all duration-150",
                  "border border-[#E8E4DA] bg-white text-[#1A1A1A]",
                  "hover:bg-[#F2EFE8] active:scale-[0.98]",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  "w-[30%]"
                )}
              >
                Decline
              </button>

              {/* Ignore - 30% */}
              <button
                type="button"
                onClick={handleIgnore}
                disabled={respond.isPending}
                className={cn(
                  "h-12 rounded-xl text-sm font-semibold transition-all duration-150",
                  "bg-transparent text-[#6B6B66]",
                  "hover:text-[#1A1A1A] hover:bg-[#F2EFE8]/50 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  "w-[30%]"
                )}
              >
                Ignore
              </button>

              {/* Accept - 40% (slightly wider for primary action prominence) */}
              <button
                type="button"
                onClick={handleAccept}
                disabled={respond.isPending}
                className={cn(
                  "h-12 rounded-xl text-sm font-semibold transition-all duration-150",
                  "bg-[#B8762A] text-white",
                  "hover:bg-[#D4A053] active:scale-[0.98]",
                  "disabled:opacity-50 disabled:pointer-events-none",
                  "flex-1 flex items-center justify-center gap-2"
                )}
              >
                {respond.isPending && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
