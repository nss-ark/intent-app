"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  ClipboardCheck,
  Users,
  Crown,
  Gem,
  Link2,
  Lock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Hardcoded data                                                      */
/* ------------------------------------------------------------------ */

const badges = [
  {
    label: "Class of 2026",
    icon: GraduationCap,
    active: true,
    gradientFrom: "#B8762A",
    gradientTo: "#D4A053",
  },
  {
    label: "First Connection",
    icon: Link2,
    active: true,
    gradientFrom: "#2D4A3A",
    gradientTo: "#3D6B52",
  },
  {
    label: "First Survey",
    icon: ClipboardCheck,
    active: true,
    gradientFrom: "#B8762A",
    gradientTo: "#D4A053",
  },
  {
    label: "Top Mentor",
    icon: Crown,
    active: false,
    gradientFrom: "",
    gradientTo: "",
  },
  {
    label: "Connector",
    icon: Users,
    active: false,
    gradientFrom: "",
    gradientTo: "",
  },
  {
    label: "Pillar",
    icon: Gem,
    active: false,
    gradientFrom: "",
    gradientTo: "",
  },
];

const weekStats = [
  { label: "Nudges responded within 48 hours", value: "2", points: "+10 pts" },
  { label: "Sessions completed", value: "1", points: "+15 pts" },
  { label: "Survey completed", value: "1", points: "+5 pts" },
  { label: "Meetup attended", value: "1", points: "+20 pts" },
];

const lifetimeStats = [
  { number: "12", label: "Connections made" },
  { number: "8", label: "Mentorship sessions" },
  { number: "3", label: "Events attended" },
  { number: "47", label: "Total points" },
  { number: "5", label: "Surveys completed" },
  { number: "2", label: "Resources shared" },
];

/* ------------------------------------------------------------------ */
/* Progress bar segments                                               */
/* ------------------------------------------------------------------ */

function SegmentedProgressBar() {
  // 4 segments: 1 full, 2 full, 3 at 60%, 4 empty
  const segments = [1.0, 1.0, 0.6, 0.0];

  return (
    <div className="flex gap-1.5">
      {segments.map((fill, i) => (
        <div
          key={i}
          className="relative h-2 flex-1 overflow-hidden rounded-full"
          style={{ backgroundColor: "rgba(184, 118, 42, 0.15)" }}
        >
          {fill > 0 && (
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${fill * 100}%`,
                backgroundColor: "#B8762A",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Badge card                                                          */
/* ------------------------------------------------------------------ */

function BadgeCard({
  badge,
}: {
  badge: (typeof badges)[number];
}) {
  const Icon = badge.active ? badge.icon : badge.icon;

  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div
        className="flex h-[96px] w-[96px] items-center justify-center rounded-2xl"
        style={
          badge.active
            ? {
                background: `linear-gradient(135deg, ${badge.gradientFrom}, ${badge.gradientTo})`,
              }
            : {
                backgroundColor: "#E8E4DA",
              }
        }
      >
        {badge.active ? (
          <Icon size={32} strokeWidth={1.5} className="text-white" />
        ) : (
          <div className="relative">
            <Icon
              size={28}
              strokeWidth={1.5}
              className="text-[#9B9B94]"
            />
            <Lock
              size={12}
              strokeWidth={2}
              className="absolute -bottom-1 -right-1 text-[#9B9B94]"
            />
          </div>
        )}
      </div>
      <span
        className="max-w-[96px] text-center text-[11px] font-medium leading-tight"
        style={{
          color: badge.active ? "#1A1A1A" : "#9B9B94",
        }}
      >
        {badge.label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ContributionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex h-14 max-w-[640px] items-center px-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-[var(--muted)]"
            aria-label="Go back"
          >
            <ArrowLeft
              size={20}
              strokeWidth={1.5}
              className="text-[var(--intent-text-primary)]"
            />
          </button>
          <h1 className="flex-1 text-center text-[16px] font-semibold text-[var(--intent-text-primary)]">
            Your contributions
          </h1>
          {/* Spacer to balance the back arrow */}
          <div className="h-10 w-10" />
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pb-8">
        {/* ── Level Hero Card ──────────────────────────────────── */}
        <div
          className="mt-4 rounded-[20px] p-6"
          style={{
            background: "linear-gradient(135deg, #FFE9CB 0%, #FAFAF6 100%)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "#B8762A" }}
          >
            Level 2
          </p>
          <h2
            className="mt-1 text-[28px] font-semibold leading-tight"
            style={{ color: "#1A1A1A" }}
          >
            Contributor
          </h2>

          <div className="mt-5">
            <SegmentedProgressBar />
          </div>

          <p
            className="mt-3 text-[13px]"
            style={{ color: "#6B6B66" }}
          >
            47 / 75 points to next level
          </p>

          <p
            className="mt-3 text-[14px] leading-relaxed"
            style={{ color: "#6B6B66" }}
          >
            You&apos;re a Contributor. Connectors get an extra 2 nudges per week
            and early access to high-demand panels.
          </p>
        </div>

        {/* ── Recognition Section ──────────────────────────────── */}
        <div className="mt-8">
          <h3 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">
            Recognition
          </h3>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {badges.map((badge) => (
              <BadgeCard key={badge.label} badge={badge} />
            ))}
          </div>
        </div>

        {/* ── This Week Section ────────────────────────────────── */}
        <div className="mt-8">
          <h3 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">
            This week
          </h3>
          <div
            className="mt-4 overflow-hidden rounded-2xl bg-white"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            {weekStats.map((stat, i) => (
              <div key={stat.label}>
                {i > 0 && (
                  <div
                    className="mx-4 h-px"
                    style={{ backgroundColor: "#E8E4DA" }}
                  />
                )}
                <div className="flex items-center justify-between px-4 py-3.5">
                  <p className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
                    {stat.label}:{" "}
                    <span className="font-semibold">{stat.value}</span>
                  </p>
                  <span
                    className="ml-3 shrink-0 text-[13px] font-semibold"
                    style={{ color: "#B8762A" }}
                  >
                    {stat.points}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Lifetime Activity Section ────────────────────────── */}
        <div className="mt-8">
          <h3 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">
            Lifetime activity
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {lifetimeStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl px-4 py-4"
                style={{ backgroundColor: "#F2EFE8" }}
              >
                <p
                  className="text-[22px] font-semibold leading-tight"
                  style={{ color: "#1A1A1A" }}
                >
                  {stat.number}
                </p>
                <p
                  className="mt-1 text-[12px] leading-snug"
                  style={{ color: "#6B6B66" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer caption ───────────────────────────────────── */}
        <p
          className="mt-8 text-center text-[13px]"
          style={{ color: "#6B6B66" }}
        >
          We don&apos;t share your activity stats with other members.
        </p>
      </div>
    </div>
  );
}
