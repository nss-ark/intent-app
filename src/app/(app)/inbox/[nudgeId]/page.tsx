"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

// ── Sample data ────────────────────────────────────────────────────────

const senderData = {
  id: "user-vikram-001",
  fullName: "Vikram Subramanian",
  photoUrl: null as string | null,
  badges: ["Founder", "ISB '22"],
  program: "PGP, Class of 2022",
  currentCity: "Mumbai",
  currentRole: "CEO & Co-founder, FraudShield",
};

const nudgeData = {
  id: "nudge-001",
  signal: "Looking for a co-founder",
  signalType: "mutual" as const,
  message:
    "Arjun, your background at Flipkart and your interest in fintech caught my eye. I'm building a fraud-detection layer for sub-prime lending in tier-2 markets and looking for a product co-founder who's worked at scale. Would love 30 minutes if you're open to a chat. \u2014 Vik",
  sentAt: "2 hours ago",
};

// ── Component ──────────────────────────────────────────────────────────

export default function NudgeDetailPage() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleAccept = () => {
    // In production: PATCH nudge status to accepted, create conversation
    router.push("/inbox");
  };

  const handleDecline = () => {
    // In production: PATCH nudge status to declined
    router.push("/inbox");
  };

  const handleIgnore = () => {
    // In production: no status change, just navigate back
    router.push("/inbox");
  };

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
                    onClick={() => setShowMenu(false)}
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
              {senderData.photoUrl ? (
                <img
                  src={senderData.photoUrl}
                  alt={senderData.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-medium text-[#6B6B66]">
                  {getInitials(senderData.fullName)}
                </div>
              )}
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  {senderData.fullName}
                </h2>
                {senderData.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#2D4A3A] text-white leading-none"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[#6B6B66] mt-0.5">
                {senderData.program} &middot; {senderData.currentCity}
              </p>
              <p className="text-sm text-[#6B6B66] mt-0.5">
                {senderData.currentRole}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E8E4DA]" />

          {/* Signal indicator card */}
          <div className="rounded-xl bg-[#F5EDE0]/60 p-4">
            <p className="text-sm text-[#6B6B66] mb-1">
              <span className="font-medium text-[#1A1A1A]">
                {senderData.fullName.split(" ")[0]}
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
                {nudgeData.signal}
              </span>
            </div>
          </div>

          {/* Full message body */}
          <div className="space-y-3">
            <p className="text-base text-[#1A1A1A] leading-relaxed whitespace-pre-line">
              {nudgeData.message}
            </p>
            <p className="text-xs text-[#6B6B66]">
              Sent {nudgeData.sentAt}
            </p>
          </div>

          {/* Cooldown notice card */}
          <div className="rounded-xl bg-[#F5EDE0]/60 border-l-[3px] border-l-[#B8762A] p-4">
            <p className="text-sm text-[#6B6B66] leading-relaxed">
              If you decline,{" "}
              <span className="font-medium text-[#1A1A1A]">
                {senderData.fullName.split(" ")[0]}
              </span>{" "}
              won&apos;t be able to nudge you again for 90 days. If you ignore,
              the nudge expires in 14 days.
            </p>
          </div>

          {/* Spacer for sticky bottom + tab bar */}
          <div className="h-44" />
        </div>
      </main>

      {/* ── Sticky bottom action bar (above tab bar) ──────────────── */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-[#FAFAF6]/95 backdrop-blur-sm border-t border-[#E8E4DA] safe-bottom">
        <div className="max-w-[640px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Decline - 30% */}
            <button
              type="button"
              onClick={handleDecline}
              className={cn(
                "h-12 rounded-xl text-sm font-semibold transition-all duration-150",
                "border border-[#E8E4DA] bg-white text-[#1A1A1A]",
                "hover:bg-[#F2EFE8] active:scale-[0.98]",
                "w-[30%]"
              )}
            >
              Decline
            </button>

            {/* Ignore - 30% */}
            <button
              type="button"
              onClick={handleIgnore}
              className={cn(
                "h-12 rounded-xl text-sm font-semibold transition-all duration-150",
                "bg-transparent text-[#6B6B66]",
                "hover:text-[#1A1A1A] hover:bg-[#F2EFE8]/50 active:scale-[0.98]",
                "w-[30%]"
              )}
            >
              Ignore
            </button>

            {/* Accept - 40% (slightly wider for primary action prominence) */}
            <button
              type="button"
              onClick={handleAccept}
              className={cn(
                "h-12 rounded-xl text-sm font-semibold transition-all duration-150",
                "bg-[#B8762A] text-white",
                "hover:bg-[#D4A053] active:scale-[0.98]",
                "flex-1"
              )}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
