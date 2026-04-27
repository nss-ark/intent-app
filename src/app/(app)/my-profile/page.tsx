"use client";

import Link from "next/link";
import {
  Settings,
  Camera,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  Share2,
  MessageSquare,
  Eye,
  Star,
  Loader2,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* Quick stat card                                                      */
/* ------------------------------------------------------------------ */

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-white p-4 shadow-[var(--card-shadow)]">
      <span className="text-[20px] font-bold text-[var(--intent-text-primary)]">
        {value}
      </span>
      <span className="text-[12px] text-[var(--intent-text-secondary)]">
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Open-to row                                                          */
/* ------------------------------------------------------------------ */

function OpenToRow({
  icon: Icon,
  count,
  label,
  color,
}: {
  icon: React.ElementType;
  count: number;
  label: string;
  color: "amber" | "green" | "neutral";
}) {
  const iconColor =
    color === "amber"
      ? "text-[var(--intent-amber)]"
      : color === "green"
      ? "text-[var(--intent-green)]"
      : "text-[var(--intent-text-secondary)]";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={18} strokeWidth={1.5} className={iconColor} />
      <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
        <span className="font-semibold">{count}</span> {label}
      </span>
      <ChevronRight
        size={18}
        strokeWidth={1.5}
        className="text-[var(--intent-text-secondary)]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Activity row                                                         */
/* ------------------------------------------------------------------ */

function ActivityRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon
        size={18}
        strokeWidth={1.5}
        className="text-[var(--intent-text-secondary)]"
      />
      <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
        {label}
      </span>
      <span className="mr-2 text-[13px] text-[var(--intent-text-secondary)]">
        {value}
      </span>
      <ChevronRight
        size={18}
        strokeWidth={1.5}
        className="text-[var(--intent-text-secondary)]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                       */
/* ------------------------------------------------------------------ */

export default function MyProfilePage() {
  const { data: user, isLoading, isError } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--intent-bg)]">
        <Loader2 className="size-8 animate-spin text-[var(--intent-amber)]" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--intent-bg)]">
        <p className="text-[var(--intent-text-secondary)]">
          Could not load your profile
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="rounded-xl"
        >
          Retry
        </Button>
      </div>
    );
  }

  /* Derive display values from API data */
  const location = [user.profile?.currentCity, user.profile?.currentCountry]
    .filter(Boolean)
    .join(", ");

  const currentExp = user.experience.find((e) => e.isCurrent);
  const subtitle = [
    user.program,
    user.graduationYear ? `Class of ${user.graduationYear}` : null,
    location || null,
  ]
    .filter(Boolean)
    .join(" \u00B7 ");

  const gamification = user.gamificationState;
  const totalPoints = gamification?.totalPoints ?? 0;
  const currentLevel = gamification?.currentLevel ?? 0;
  const nudgesSent = gamification?.nudgesSentLifetime ?? 0;

  /* Categorize open signals */
  const askSignals = user.openSignals.filter(
    (s) => s.isOpen && s.tenantSignal.template.signalType === "ASK"
  );
  const offerSignals = user.openSignals.filter(
    (s) => s.isOpen && s.tenantSignal.template.signalType === "OFFER"
  );
  const mutualSignals = user.openSignals.filter(
    (s) => s.isOpen && s.tenantSignal.template.signalType === "MUTUAL"
  );

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--intent-text-tertiary)] bg-white/95 px-4 backdrop-blur-md safe-top">
        <div className="w-10" />
        <h1 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">
          My profile
        </h1>
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
          aria-label="Settings"
        >
          <Settings
            size={22}
            strokeWidth={1.5}
            className="text-[var(--intent-text-primary)]"
          />
        </Link>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pb-32 pt-6">
        {/* Hero card */}
        <div className="rounded-2xl bg-white p-6 shadow-[var(--card-shadow)]">
          {/* Avatar with camera overlay */}
          <div className="relative mx-auto w-fit">
            <AvatarPlaceholder name={user.fullName} size={96} />
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--intent-amber)] shadow-sm">
              <Camera size={14} className="text-white" />
            </div>
          </div>

          {/* Name and subtitle */}
          <h2 className="mt-4 text-center text-[24px] font-bold text-[var(--intent-text-primary)]">
            {user.fullName}
          </h2>
          <p className="mt-1 text-center text-[13px] text-[var(--intent-text-secondary)]">
            {subtitle}
          </p>

          {/* Edit profile button */}
          <div className="mt-4 flex justify-center">
            <Link href="/my-profile/edit">
              <Button
                variant="outline"
                className="rounded-xl border-[var(--intent-text-tertiary)] px-6 text-[14px] font-medium"
              >
                Edit profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-4 flex gap-3">
          <StatCard
            value={String(user.niches.length + user.badges.length)}
            label="Connections"
          />
          <StatCard
            value={currentLevel > 0 ? `Level ${currentLevel}` : "—"}
            label="Contributor"
          />
          <StatCard value={String(totalPoints)} label="Points" />
        </div>

        {/* Your Intent */}
        <div className="mt-6">
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
            Your Intent
          </h3>
          <div className="rounded-2xl bg-[var(--intent-amber-subtle)]/60 p-4">
            <p className="text-[14px] italic leading-relaxed text-[var(--intent-text-primary)]">
              &ldquo;
              {user.profile?.missionStatement ||
                "No mission statement yet. Tell the community what you are looking for."}
              &rdquo;
            </p>
            <Link
              href="/my-profile/edit"
              className="mt-2 inline-block text-[13px] font-medium text-[var(--intent-amber)] hover:underline"
            >
              Edit your Intent
            </Link>
          </div>
        </div>

        {/* Open to */}
        <div className="mt-6">
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
            Open to
          </h3>
          <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white shadow-[var(--card-shadow)]">
            <OpenToRow
              icon={ArrowDown}
              count={askSignals.length}
              label={askSignals.length === 1 ? "Ask" : "Asks"}
              color="amber"
            />
            <OpenToRow
              icon={ArrowUp}
              count={offerSignals.length}
              label={offerSignals.length === 1 ? "Offer" : "Offers"}
              color="green"
            />
            <OpenToRow
              icon={ArrowLeftRight}
              count={mutualSignals.length}
              label={mutualSignals.length === 1 ? "Mutual" : "Mutuals"}
              color="neutral"
            />
          </div>
        </div>

        {/* Activity */}
        <div className="mt-6">
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
            Activity
          </h3>
          <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white shadow-[var(--card-shadow)]">
            <ActivityRow
              icon={MessageSquare}
              label="Nudges sent"
              value={String(nudgesSent)}
            />
            <ActivityRow
              icon={Eye}
              label="Profile views"
              value="—"
            />
            <ActivityRow
              icon={Star}
              label="Endorsements"
              value={String(user.badges.length)}
            />
          </div>
        </div>

        {/* Share profile */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button
            variant="outline"
            className="w-full rounded-xl border-[var(--intent-text-tertiary)] py-3 text-[14px] font-medium"
          >
            <Share2 size={16} className="mr-2" />
            Share your profile
          </Button>
          <button className="text-[13px] font-medium text-[var(--intent-amber)] hover:underline">
            View your card as others see it
          </button>
        </div>
      </div>
    </div>
  );
}
