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
} from "lucide-react";
import { sampleMembers, currentUser } from "@/data/sample-members";
import { HeroPlaceholder, AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SampleMember } from "@/data/sample-members";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getMemberById(id: string): SampleMember | undefined {
  if (id === "6" || id === currentUser.id) return currentUser;
  return sampleMembers.find((m) => m.id === id);
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
  period,
  isCurrent,
}: {
  company: string;
  role: string;
  period: string;
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
        <p className="text-[12px] text-[var(--intent-text-secondary)]">
          {period}
          {isCurrent && (
            <span className="ml-1.5 inline-flex items-center rounded-full bg-[var(--intent-green-subtle)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--intent-green)]">
              Current
            </span>
          )}
        </p>
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
  const member = getMemberById(id);

  if (!member) {
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

  const isOwnProfile = member.id === currentUser.id;

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
          gradientFrom={member.gradientFrom}
          gradientTo={member.gradientTo}
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
                {member.isVerified && (
                  <CheckCircle2
                    size={20}
                    className="shrink-0 fill-[var(--intent-green)] text-white"
                  />
                )}
                {member.isFounder && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--intent-green)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                    <Shield size={11} />
                    Founder
                  </span>
                )}
              </div>
              <p className="mt-1 text-[14px] text-[var(--intent-text-secondary)]">
                {member.yearsOfExperience} years &middot; Class of{" "}
                {member.classYear} &middot; {member.program}
              </p>
            </div>
          </div>

          {/* Company badges */}
          <div className="mt-4 flex items-center gap-2">
            <AvatarPlaceholder
              name={member.currentCompany}
              size={28}
              gradientFrom={member.gradientFrom}
              gradientTo={member.gradientTo}
            />
            <span className="text-[14px] font-medium text-[var(--intent-text-primary)]">
              {member.currentCompany}
            </span>
            {member.previousCompanies.map((co) => (
              <span key={co} className="flex items-center gap-1.5">
                <span className="text-[var(--intent-text-secondary)]">
                  &rarr;
                </span>
                <AvatarPlaceholder name={co} size={24} />
                <span className="text-[13px] text-[var(--intent-text-secondary)]">
                  {co}
                </span>
              </span>
            ))}
          </div>

          {/* Intent statement */}
          <div className="mt-6 rounded-2xl bg-[var(--intent-amber-subtle)]/50 p-4">
            <div className="flex items-start gap-2">
              <span className="text-2xl leading-none text-[var(--intent-amber)]">
                &ldquo;
              </span>
              <p className="flex-1 text-[15px] italic leading-relaxed text-[var(--intent-text-primary)]">
                {member.intent}
              </p>
              <span className="self-end text-2xl leading-none text-[var(--intent-amber)]">
                &rdquo;
              </span>
            </div>
          </div>

          <Separator className="my-6 bg-[var(--intent-text-tertiary)]" />

          {/* Metadata grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MetadataRow
              icon={MapPin}
              label="Location"
              value={member.city}
            />
            <MetadataRow
              icon={Briefcase}
              label="Current Role"
              value={`${member.currentRole} at ${member.currentCompany}`}
            />
            <MetadataRow
              icon={GraduationCap}
              label="Education"
              value={member.education}
            />
            <MetadataRow
              icon={Building2}
              label="Domain"
              value={member.domain}
            />
          </div>

          <Separator className="my-6 bg-[var(--intent-text-tertiary)]" />

          {/* Asks & Offers section */}
          <div>
            <h2 className="text-base font-semibold text-[var(--intent-text-primary)]">
              What {member.fullName.split(" ")[0]} is open to
            </h2>

            {member.askSignals.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--intent-amber)]">
                  Asks
                </p>
                <div className="flex flex-wrap gap-2">
                  {member.askSignals.map((signal) => (
                    <SignalPill key={signal} label={signal} type="ask" />
                  ))}
                </div>
              </div>
            )}

            {member.offerSignals.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[var(--intent-green)]">
                  Offers
                </p>
                <div className="flex flex-wrap gap-2">
                  {member.offerSignals.map((signal) => (
                    <SignalPill key={signal} label={signal} type="offer" />
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
              {member.experience.map((exp, i) => (
                <ExperienceItem key={i} {...exp} />
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
              {member.badges.map((badge) => (
                <div
                  key={badge}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-2xl",
                      badge === "Founder"
                        ? "bg-[var(--intent-green)]"
                        : badge.includes("Verified")
                        ? "bg-[var(--intent-green-subtle)]"
                        : badge.includes("Mentor")
                        ? "bg-[var(--intent-amber-subtle)]"
                        : "bg-[var(--muted)]"
                    )}
                  >
                    {badge === "Founder" ? (
                      <Shield size={24} className="text-white" />
                    ) : badge.includes("Verified") ? (
                      <CheckCircle2
                        size={24}
                        className="text-[var(--intent-green)]"
                      />
                    ) : badge.includes("Mentor") ? (
                      <GraduationCap
                        size={24}
                        className="text-[var(--intent-amber)]"
                      />
                    ) : badge.includes("Contributor") ? (
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
                    {badge}
                  </span>
                </div>
              ))}
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
