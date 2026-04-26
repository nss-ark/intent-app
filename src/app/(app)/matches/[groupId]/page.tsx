"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Clock } from "lucide-react";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Match data                                                          */
/* ------------------------------------------------------------------ */

interface MatchMember {
  name: string;
  classYear: number;
  city: string;
  isYou?: boolean;
}

const matchMembers: MatchMember[] = [
  { name: "Ananya Reddy", classYear: 2018, city: "Bangalore" },
  { name: "Vikram Mehta", classYear: 2014, city: "Mumbai" },
  { name: "Priya Nair", classYear: 2020, city: "Hyderabad" },
  { name: "Rohan Kapoor", classYear: 2016, city: "Mumbai" },
  { name: "Arjun Iyer", classYear: 2026, city: "Hyderabad", isYou: true },
];

const commonTraits = [
  "Operating roles",
  "Climate-leaning",
  "5+ years experience",
  "Drawn to early-stage",
];

/* ------------------------------------------------------------------ */
/* Member row                                                          */
/* ------------------------------------------------------------------ */

function MemberRow({ member }: { member: MatchMember }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <AvatarPlaceholder name={member.name} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-[var(--intent-text-primary)]">
            {member.name}
          </span>
          {member.isYou && (
            <span className="inline-flex h-5 items-center rounded-full bg-[var(--intent-amber-subtle)] px-2 text-[11px] font-medium text-[var(--intent-amber)]">
              (You)
            </span>
          )}
        </div>
        <p className="text-[12px] text-[var(--intent-text-secondary)]">
          Class of {member.classYear} &middot; {member.city}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function MatchGroupPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--intent-bg)]">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex h-14 max-w-[640px] items-center px-4">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[var(--muted)] transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} strokeWidth={1.5} className="text-[var(--intent-text-primary)]" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-[var(--intent-text-primary)]">
            You've been matched
          </h1>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[640px] flex-1 px-4 py-6">
        {/* Illustration */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--intent-amber-subtle)]">
            <Users
              size={48}
              strokeWidth={1}
              className="text-[var(--intent-amber)]"
            />
          </div>

          {/* Headline */}
          <h2 className="mt-5 text-[26px] font-bold leading-tight text-[var(--intent-text-primary)]">
            We found 5 ISB members who think like you.
          </h2>
          <p className="mt-2 text-[14px] text-[var(--intent-text-secondary)]">
            Based on the Career Fork survey you took on Tuesday.
          </p>
        </div>

        {/* ── Match group card ──────────────────────────────────── */}
        <div className="mt-6 intent-card rounded-2xl p-5">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
            Your match group
          </h3>
          <div className="mt-3 divide-y divide-[var(--intent-text-tertiary)]">
            {matchMembers.map((member) => (
              <MemberRow key={member.name} member={member} />
            ))}
          </div>
        </div>

        {/* ── Common traits ─────────────────────────────────────── */}
        <div className="mt-5">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
            What you have in common
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {commonTraits.map((trait) => (
              <span
                key={trait}
                className="inline-flex h-8 items-center rounded-full bg-[var(--intent-amber-subtle)] px-3.5 text-[13px] font-medium text-[var(--intent-text-primary)]"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* ── Meetup proposal ───────────────────────────────────── */}
        <div className="mt-5 rounded-2xl bg-[var(--intent-amber-subtle)]/60 p-5">
          <h3 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">
            We've proposed a meetup
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--intent-text-primary)]">
            Friday Nov 15, 7:30 pm at Olive Bistro, Banjara Hills, Hyderabad
          </p>
          <div className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[var(--intent-amber)]">
            <Clock size={15} strokeWidth={1.5} />
            RSVP closes in 3 days
          </div>
        </div>
      </div>

      {/* ── Bottom actions ──────────────────────────────────────── */}
      <div
        className="sticky bottom-16 z-30 border-t bg-white/95 backdrop-blur-md safe-bottom"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex max-w-[640px] items-center gap-3 px-4 py-3">
          {/* Maybe later - 30% */}
          <button className="flex h-12 w-[30%] items-center justify-center rounded-xl border border-[var(--intent-text-tertiary)] bg-white text-[14px] font-medium text-[var(--intent-text-secondary)] transition-colors hover:bg-[var(--muted)]">
            Maybe later
          </button>

          {/* Yes, I'll be there - 70% */}
          <button className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[var(--intent-amber)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)]">
            Yes, I'll be there
          </button>
        </div>
      </div>
    </div>
  );
}
