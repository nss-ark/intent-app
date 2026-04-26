"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignalPill, type SignalPillData } from "@/components/signal-pill";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

// ── Sample data ────────────────────────────────────────────────────────

const recipientData = {
  id: "user-ananya-001",
  fullName: "Ananya Krishnan",
  photoUrl: null as string | null,
  program: "MBA, Class of 2024",
  currentCity: "Bengaluru",
  currentRole: "Product Manager at Razorpay",
};

const matchingSignals: SignalPillData[] = [
  {
    id: "sig-001",
    code: "cofounder_search",
    displayName: "Looking for a co-founder",
    signalType: "mutual",
  },
  {
    id: "sig-002",
    code: "coffee_chat",
    displayName: "Open to coffee chat",
    signalType: "mutual",
  },
  {
    id: "sig-003",
    code: "curious_company",
    displayName: "Curious about Razorpay",
    signalType: "ask",
  },
];

const MAX_CHARS = 400;

// ── Component ──────────────────────────────────────────────────────────

export default function NudgeComposerPage() {
  const router = useRouter();
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const isReady = selectedSignal !== null && message.trim().length > 0;
  const charCount = message.length;

  const handleSignalClick = (signal: SignalPillData) => {
    setSelectedSignal((prev) => (prev === signal.id ? null : signal.id));
  };

  const handleSend = () => {
    if (!isReady) return;
    // In production: POST to API, then navigate
    router.push("/inbox");
  };

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
            Send
          </button>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[640px] mx-auto px-4 py-6 space-y-6">
          {/* Recipient row */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F2EFE8] shrink-0">
              {recipientData.photoUrl ? (
                <img
                  src={recipientData.photoUrl}
                  alt={recipientData.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-medium text-[#6B6B66]">
                  {getInitials(recipientData.fullName)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#1A1A1A] truncate">
                {recipientData.fullName}
              </p>
              <p className="text-sm text-[#6B6B66] truncate">
                {recipientData.program} &middot; {recipientData.currentCity}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E8E4DA]" />

          {/* Signal selection */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">
              What&apos;s this about?
            </h2>
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
            <p className="text-xs text-[#6B6B66] leading-relaxed">
              We only show signals that match what{" "}
              <span className="font-medium text-[#1A1A1A]">
                {recipientData.fullName.split(" ")[0]}
              </span>{" "}
              is open to right now.
            </p>
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
              placeholder={`Be specific. What's the ask? Why ${recipientData.fullName.split(" ")[0]} specifically?`}
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

          {/* Cooldown info card */}
          <div className="rounded-xl bg-[#F5EDE0]/60 border-l-[3px] border-l-[#B8762A] p-4">
            <p className="text-sm text-[#6B6B66] leading-relaxed">
              If{" "}
              <span className="font-medium text-[#1A1A1A]">
                {recipientData.fullName.split(" ")[0]}
              </span>{" "}
              doesn&apos;t accept, you&apos;ll need to wait 30 days before
              nudging again.
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
            Send nudge
          </button>
          <p className="text-center text-xs text-[#6B6B66]">
            You have <span className="font-medium text-[#1A1A1A]">4</span> nudges
            left this week.
          </p>
        </div>
      </div>
    </div>
  );
}
