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
  Loader2,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

/* ------------------------------------------------------------------ */
/* Level definitions (mirrors prisma seed)                             */
/* ------------------------------------------------------------------ */

const LEVELS = [
  { level: 1, name: "Newcomer", pointsRequired: 0 },
  { level: 2, name: "Contributor", pointsRequired: 25 },
  { level: 3, name: "Connector", pointsRequired: 75 },
  { level: 4, name: "Pillar", pointsRequired: 200 },
];

function getLevelInfo(level: number) {
  return LEVELS.find((l) => l.level === level) ?? LEVELS[0];
}

function getNextLevelInfo(level: number) {
  return LEVELS.find((l) => l.level === level + 1) ?? null;
}

/* ------------------------------------------------------------------ */
/* Badge icon mapping                                                  */
/* ------------------------------------------------------------------ */

const BADGE_ICON_MAP: Record<string, React.ElementType> = {
  CLASS_BADGE: GraduationCap,
  FIRST_CONNECTION: Link2,
  FIRST_SURVEY: ClipboardCheck,
  TOP_MENTOR: Crown,
  CONNECTOR: Users,
  PILLAR: Gem,
};

const BADGE_GRADIENT_MAP: Record<string, { from: string; to: string }> = {
  CLASS_BADGE: { from: "#1B3A5F", to: "#2E6399" },
  FIRST_CONNECTION: { from: "#2D4A3A", to: "#3D6B52" },
  FIRST_SURVEY: { from: "#1B3A5F", to: "#2E6399" },
  TOP_MENTOR: { from: "#1B3A5F", to: "#2E6399" },
  CONNECTOR: { from: "#2D4A3A", to: "#3D6B52" },
  PILLAR: { from: "#1B3A5F", to: "#2E6399" },
};

/* ------------------------------------------------------------------ */
/* Static fallback badge definitions (when no badges from API)         */
/* ------------------------------------------------------------------ */

const FALLBACK_BADGES = [
  {
    label: "Class of 2026",
    icon: GraduationCap,
    active: false,
    gradientFrom: "#1B3A5F",
    gradientTo: "#2E6399",
  },
  {
    label: "First Connection",
    icon: Link2,
    active: false,
    gradientFrom: "#2D4A3A",
    gradientTo: "#3D6B52",
  },
  {
    label: "First Survey",
    icon: ClipboardCheck,
    active: false,
    gradientFrom: "#1B3A5F",
    gradientTo: "#2E6399",
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

/* ------------------------------------------------------------------ */
/* Progress bar segments                                               */
/* ------------------------------------------------------------------ */

function SegmentedProgressBar({
  currentPoints,
  currentLevel,
}: {
  currentPoints: number;
  currentLevel: number;
}) {
  // Build segments based on level thresholds
  const segments = LEVELS.map((l) => {
    if (currentLevel > l.level) return 1.0; // Fully completed level
    if (currentLevel < l.level) return 0.0; // Not yet reached
    // Current level: show partial progress toward next level
    const nextLevel = getNextLevelInfo(l.level);
    if (!nextLevel) return 1.0; // Max level
    const range = nextLevel.pointsRequired - l.pointsRequired;
    if (range <= 0) return 1.0;
    return Math.min(1, (currentPoints - l.pointsRequired) / range);
  });

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
                backgroundColor: "#1B3A5F",
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
  badge: (typeof FALLBACK_BADGES)[number];
}) {
  const Icon = badge.icon;

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
                backgroundColor: "#D8DCE5",
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
  const { data: user, isLoading } = useCurrentUser();

  // Extract gamification data from user, with safe defaults
  const gamification = user?.gamificationState;
  const totalPoints = gamification?.totalPoints ?? 0;
  const currentLevel = gamification?.currentLevel ?? 1;
  const currentStreakWeeks = gamification?.currentStreakWeeks ?? 0;
  const nudgesSentLifetime = gamification?.nudgesSentLifetime ?? 0;
  const nudgesAcceptedLifetime = gamification?.nudgesAcceptedLifetime ?? 0;

  // Extended gamification state (returned by API but not fully typed in hook)
  const gamificationAny = gamification as Record<string, number> | null;
  const surveysCompletedCount = gamificationAny?.surveysCompletedCount ?? 0;
  const eventsAttendedCount = gamificationAny?.eventsAttendedCount ?? 0;
  const mentorshipsAsMentorCount = gamificationAny?.mentorshipsAsMentorCount ?? 0;
  const resourcesSharedCount = gamificationAny?.resourcesSharedCount ?? 0;

  const levelInfo = getLevelInfo(currentLevel);
  const nextLevel = getNextLevelInfo(currentLevel);

  // Build badge list from user data, falling back to defaults
  const userBadgeCodes = new Set(
    (user?.badges ?? []).map((b) => b.tenantBadge.template.code)
  );

  const badges = FALLBACK_BADGES.map((fb) => {
    // Try to match against known badge codes
    const matchingCode = Object.keys(BADGE_ICON_MAP).find(
      (code) => BADGE_ICON_MAP[code] === fb.icon
    );
    const isActive = matchingCode ? userBadgeCodes.has(matchingCode) : false;
    const gradient = matchingCode ? BADGE_GRADIENT_MAP[matchingCode] : null;
    return {
      ...fb,
      active: isActive || fb.active, // Keep active if API confirms it
      gradientFrom: gradient?.from ?? fb.gradientFrom,
      gradientTo: gradient?.to ?? fb.gradientTo,
    };
  });

  // Build lifetime stats from real data
  const lifetimeStats = [
    { number: String(nudgesAcceptedLifetime), label: "Connections made" },
    { number: String(mentorshipsAsMentorCount), label: "Mentorship sessions" },
    { number: String(eventsAttendedCount), label: "Events attended" },
    { number: String(totalPoints), label: "Total points" },
    { number: String(surveysCompletedCount), label: "Surveys completed" },
    { number: String(resourcesSharedCount), label: "Resources shared" },
  ];

  // Progress description
  const progressText = nextLevel
    ? `${totalPoints} / ${nextLevel.pointsRequired} points to next level`
    : `${totalPoints} points -- max level reached!`;

  const levelDescription = nextLevel
    ? `You're a ${levelInfo.name}. ${nextLevel.name}s get an extra 2 nudges per week and early access to high-demand panels.`
    : `You've reached ${levelInfo.name} -- the highest level. Thank you for your incredible contributions!`;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--intent-bg)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-[var(--intent-text-secondary)]"
          />
          <p className="text-[14px] text-[var(--intent-text-secondary)]">
            Loading your contributions...
          </p>
        </div>
      </div>
    );
  }

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
            background: "linear-gradient(135deg, #D4E4F7 0%, #F7F8FB 100%)",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: "#1B3A5F" }}
          >
            Level {currentLevel}
          </p>
          <h2
            className="mt-1 text-[28px] font-semibold leading-tight"
            style={{ color: "#1A1A1A" }}
          >
            {levelInfo.name}
          </h2>

          <div className="mt-5">
            <SegmentedProgressBar
              currentPoints={totalPoints}
              currentLevel={currentLevel}
            />
          </div>

          <p
            className="mt-3 text-[13px]"
            style={{ color: "#6B6B66" }}
          >
            {progressText}
          </p>

          <p
            className="mt-3 text-[14px] leading-relaxed"
            style={{ color: "#6B6B66" }}
          >
            {levelDescription}
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

        {/* ── Streak Section ──────────────────────────────────── */}
        <div className="mt-8">
          <h3 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">
            Activity streak
          </h3>
          <div
            className="mt-4 overflow-hidden rounded-2xl bg-white"
            style={{ boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between px-4 py-3.5">
              <p className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
                Current streak
              </p>
              <span
                className="ml-3 shrink-0 text-[13px] font-semibold"
                style={{ color: "#1B3A5F" }}
              >
                {currentStreakWeeks} {currentStreakWeeks === 1 ? "week" : "weeks"}
              </span>
            </div>
            <div
              className="mx-4 h-px"
              style={{ backgroundColor: "#D8DCE5" }}
            />
            <div className="flex items-center justify-between px-4 py-3.5">
              <p className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
                Nudges sent
              </p>
              <span
                className="ml-3 shrink-0 text-[13px] font-semibold"
                style={{ color: "#1B3A5F" }}
              >
                {nudgesSentLifetime}
              </span>
            </div>
            <div
              className="mx-4 h-px"
              style={{ backgroundColor: "#D8DCE5" }}
            />
            <div className="flex items-center justify-between px-4 py-3.5">
              <p className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
                Nudges accepted
              </p>
              <span
                className="ml-3 shrink-0 text-[13px] font-semibold"
                style={{ color: "#1B3A5F" }}
              >
                {nudgesAcceptedLifetime}
              </span>
            </div>
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
                style={{ backgroundColor: "#EDF0F5" }}
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
