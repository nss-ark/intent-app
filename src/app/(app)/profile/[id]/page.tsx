"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  MapPin,
  Briefcase,
  GraduationCap,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Shield,
  Building2,
  Send,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { HeroPlaceholder, AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface UserProfile {
  id: string;
  fullName: string;
  photoUrl: string | null;
  graduationYear: number | null;
  program: string | null;
  profile: {
    missionStatement: string | null;
    currentCity: string | null;
    currentCountry: string | null;
    yearsOfExperienceCached: number | null;
  } | null;
  domain: { id: string; code: string; displayName: string } | null;
  niches: { id: string; code: string; displayName: string; position: number }[];
  experience: {
    id: string;
    title: string;
    companyName: string;
    isCurrent: boolean;
  }[];
  badges: {
    id: string;
    tenantBadgeId: string;
    displayName: string;
    isVisible: boolean;
  }[];
  openSignals: {
    id: string;
    displayName: string;
    signalType: string;
    icon: string | null;
  }[];
  isVerified: boolean;
}

/* ------------------------------------------------------------------ */
/* Signal pill                                                         */
/* ------------------------------------------------------------------ */

function SignalPill({
  label,
  type,
}: {
  label: string;
  type: "ask" | "offer";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium",
        type === "ask"
          ? "bg-[var(--intent-amber-subtle)] text-[var(--intent-amber)]"
          : "bg-[var(--intent-green-subtle)] text-[var(--intent-green)]"
      )}
    >
      {type === "ask" ? (
        <ArrowDown size={12} strokeWidth={2} />
      ) : (
        <ArrowUp size={12} strokeWidth={2} />
      )}
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Experience item                                                     */
/* ------------------------------------------------------------------ */

function ExperienceItem({
  company,
  role,
  isCurrent,
}: {
  company: string;
  role: string;
  isCurrent: boolean;
}) {
  return (
    <div className="flex gap-3">
      <AvatarPlaceholder name={company} size={36} />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium text-[var(--intent-text-primary)]">
          {role}
        </p>
        <p className="text-[13px] text-[var(--intent-text-secondary)]">
          {company}
        </p>
        {isCurrent && (
          <p className="text-[12px] text-[var(--intent-text-secondary)]">
            <span className="ml-0 inline-flex items-center rounded-full bg-[var(--intent-green-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--intent-green)]">
              Current
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Metadata row                                                        */
/* ------------------------------------------------------------------ */

function MetadataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
        <Icon size={16} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
          {label}
        </p>
        <p className="text-[14px] font-medium text-[var(--intent-text-primary)]">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: currentUser } = useCurrentUser();

  const {
    data: member,
    isLoading,
    isError,
  } = useQuery<UserProfile>({
    queryKey: ["user", id],
    queryFn: () => apiFetch("/api/users/" + id),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--intent-bg)]">
        <Loader2 className="size-8 animate-spin text-[var(--intent-amber)]" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--intent-bg)]">
        <p className="text-[var(--intent-text-secondary)]">Member not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/home")}
          className="rounded-xl"
        >
          Back to feed
        </Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === member.id;

  /* Derive display values */
  const location = [member.profile?.currentCity, member.profile?.currentCountry]
    .filter(Boolean)
    .join(", ");

  const yearsOfExperience = member.profile?.yearsOfExperienceCached ?? 0;
  const domain = member.domain?.displayName ?? "—";
  const missionStatement = member.profile?.missionStatement;

  const currentExp = member.experience.find((e) => e.isCurrent);
  const currentCompanyName = currentExp?.companyName ?? "—";
  const currentRole = currentExp?.title ?? "—";

  const previousExps = member.experience.filter((e) => !e.isCurrent);

  const isFounder = member.badges.some(
    (b) => b.displayName?.toLowerCase().includes("founder")
  );
  const isVerified = member.isVerified;

  const askSignals = member.openSignals.filter(
    (s) => s.signalType === "ASK"
  );
  const offerSignals = member.openSignals.filter(
    (s) => s.signalType === "OFFER"
  );

  const educationLine = [
    member.program,
    member.graduationYear ? `Class of ${member.graduationYear}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Hero photo area ──────────────────────────────────────── */}
      <div className="relative">
        {/* Top bar overlay */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4 safe-top">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/30"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          {!isOwnProfile && (
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/30"
              aria-label="Bookmark"
            >
              <Bookmark size={20} className="text-white" />
            </button>
          )}
        </div>

        <HeroPlaceholder
          name={member.fullName}
          minHeight={320}
          className="w-full"
        />
      </div>

      {/* ── White content section overlapping photo ─────────────── */}
      <div className="relative -mt-8 rounded-t-3xl bg-white pb-32">
        <div className="mx-auto max-w-[640px] px-4 pt-6">
          {/* Name + meta */}
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--intent-text-primary)]">
                  {member.fullName}
                </h1>
                {isVerified && (
                  <CheckCircle2
                    size={20}
                    className="shrink-0 fill-[var(--intent-green)] text-white"
                  />
                )}
                {isFounder && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--intent-green)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                    <Shield size={11} />
                    Founder
                  </span>
                )}
              </div>
              <p className="mt-1 text-[14px] text-[var(--intent-text-secondary)]">
                {yearsOfExperience} years &middot;{" "}
                {member.graduationYear
                  ? `Class of ${member.graduationYear}`
                  : ""}{" "}
                &middot; {member.program}
              </p>
            </div>
          </div>

          {/* Company badges */}
          <div className="mt-4 flex items-center gap-2">
            <AvatarPlaceholder name={currentCompanyName} size={28} />
            <span className="text-[14px] font-medium text-[var(--intent-text-primary)]">
              {currentCompanyName}
            </span>
            {previousExps.map((exp) => {
              const coName = exp.companyName || "—";
              return (
                <span key={exp.id} className="flex items-center gap-1.5">
                  <span className="text-[var(--intent-text-secondary)]">
                    &rarr;
                  </span>
                  <AvatarPlaceholder name={coName} size={24} />
                  <span className="text-[13px] text-[var(--intent-text-secondary)]">
                    {coName}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Intent statement */}
          {missionStatement && (
            <div className="mt-6 rounded-2xl bg-[var(--intent-amber-subtle)]/50 p-4">
              <div className="flex items-start gap-2">
                <span className="text-2xl leading-none text-[var(--intent-amber)]">
                  &ldquo;
                </span>
                <p className="flex-1 text-[15px] italic leading-relaxed text-[var(--intent-text-primary)]">
                  {missionStatement}
                </p>
                <span className="self-end text-2xl leading-none text-[var(--intent-amber)]">
                  &rdquo;
                </span>
              </div>
            </div>
          )}

          <Separator className="my-6 bg-[var(--intent-text-tertiary)]" />

          {/* Metadata grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {location && (
              <MetadataRow icon={MapPin} label="Location" value={location} />
            )}
            <MetadataRow
              icon={Briefcase}
              label="Current Role"
              value={`${currentRole} at ${currentCompanyName}`}
            />
            {educationLine && (
              <MetadataRow
                icon={GraduationCap}
                label="Education"
                value={educationLine}
              />
            )}
            <MetadataRow icon={Building2} label="Domain" value={domain} />
          </div>

          <Separator className="my-6 bg-[var(--intent-text-tertiary)]" />

          {/* Asks & Offers section */}
          <div>
            <h2 className="text-base font-semibold text-[var(--intent-text-primary)]">
              What {member.fullName.split(" ")[0]} is open to
            </h2>

            {askSignals.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--intent-amber)]">
                  Asks
                </p>
                <div className="flex flex-wrap gap-2">
                  {askSignals.map((signal) => (
                    <SignalPill
                      key={signal.id}
                      label={signal.displayName}
                      type="ask"
                    />
                  ))}
                </div>
              </div>
            )}

            {offerSignals.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--intent-green)]">
                  Offers
                </p>
                <div className="flex flex-wrap gap-2">
                  {offerSignals.map((signal) => (
                    <SignalPill
                      key={signal.id}
                      label={signal.displayName}
                      type="offer"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6 bg-[var(--intent-text-tertiary)]" />

          {/* Experience */}
          <div>
            <h2 className="mb-4 text-base font-semibold text-[var(--intent-text-primary)]">
              Experience
            </h2>
            <div className="space-y-4">
              {member.experience.map((exp) => (
                <ExperienceItem
                  key={exp.id}
                  company={exp.companyName || "—"}
                  role={exp.title}
                  isCurrent={exp.isCurrent}
                />
              ))}
            </div>
          </div>

          <Separator className="my-6 bg-[var(--intent-text-tertiary)]" />

          {/* Badges horizontal scroll */}
          <div>
            <h2 className="mb-3 text-base font-semibold text-[var(--intent-text-primary)]">
              Badges
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {member.badges.map((badge) => {
                const nameLower = badge.displayName?.toLowerCase() ?? "";
                return (
                  <div
                    key={badge.id}
                    className="flex shrink-0 flex-col items-center gap-1.5"
                  >
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl",
                        nameLower.includes("founder")
                          ? "bg-[var(--intent-green)]"
                          : nameLower.includes("verified") || nameLower.includes("alumni")
                          ? "bg-[var(--intent-green-subtle)]"
                          : nameLower.includes("mentor")
                          ? "bg-[var(--intent-amber-subtle)]"
                          : "bg-[var(--muted)]"
                      )}
                    >
                      {nameLower.includes("founder") ? (
                        <Shield size={24} className="text-white" />
                      ) : nameLower.includes("verified") || nameLower.includes("alumni") ? (
                        <CheckCircle2
                          size={24}
                          className="text-[var(--intent-green)]"
                        />
                      ) : nameLower.includes("mentor") ? (
                        <GraduationCap
                          size={24}
                          className="text-[var(--intent-amber)]"
                        />
                      ) : nameLower.includes("contributor") ? (
                        <Send
                          size={24}
                          className="text-[var(--intent-text-secondary)]"
                        />
                      ) : (
                        <GraduationCap
                          size={24}
                          className="text-[var(--intent-text-secondary)]"
                        />
                      )}
                    </div>
                    <span className="max-w-[72px] text-center text-[11px] font-medium leading-tight text-[var(--intent-text-secondary)]">
                      {badge.displayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky bottom action bar ────────────────────────────── */}
      {!isOwnProfile && (
        <div
          className="fixed inset-x-0 bottom-16 z-30 border-t bg-white/95 backdrop-blur-md safe-bottom"
          style={{ borderColor: "var(--intent-text-tertiary)" }}
        >
          <div className="mx-auto flex max-w-[640px] items-center gap-3 px-4 py-3">
            <Button
              className="h-12 flex-1 rounded-xl bg-[var(--intent-amber)] text-[15px] font-semibold text-white hover:bg-[var(--intent-amber-light)]"
            >
              <Send size={18} className="mr-2" />
              Send a nudge
            </Button>
            <Button
              variant="outline"
              className="h-12 shrink-0 rounded-xl border-[var(--intent-text-tertiary)] px-5 text-[15px] font-medium"
            >
              <Bookmark size={18} className="mr-2" />
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
