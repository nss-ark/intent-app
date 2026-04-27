"use client";

import Link from "next/link";
import { MapPin, CheckCircle2, Shield, Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroPlaceholder, AvatarPlaceholder } from "@/components/avatar-placeholder";
import { SignalIcon } from "@/components/lucide-icon";
import type { DiscoveryMember } from "@/hooks/use-discovery";

interface MemberCardProps {
  member: DiscoveryMember;
  isSaved?: boolean;
  onToggleSave?: (userId: string) => void;
  className?: string;
}

export function MemberCard({ member, isSaved, onToggleSave, className }: MemberCardProps) {
  const isFounder = member.badges?.some((b) => b.displayName?.toLowerCase().includes("founder")) ?? false;

  // Deduplicate signals by icon, take up to 4
  const signalIcons = member.openSignals
    ? Array.from(
        new Map(member.openSignals.map((s) => [s.icon, s])).values()
      ).slice(0, 4)
    : [];

  // Compact metadata pieces
  const metaParts: string[] = [];
  if (member.currentCompany) metaParts.push(member.currentCompany);
  if (member.domain) metaParts.push(member.domain.displayName);
  if (member.currentCity) metaParts.push(member.currentCity);

  return (
    <Link
      href={`/profile/${member.id}`}
      className={cn(
        "intent-card group block overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {/* ── Hero area with overlays ───────────────────────────── */}
      <div className="relative">
        <HeroPlaceholder
          name={member.fullName}
          minHeight={180}
          className="rounded-t-2xl"
        />

        {/* Bookmark button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave(member.id);
            }}
            className={cn(
              "absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all",
              isSaved
                ? "bg-white/90 shadow-sm"
                : "bg-black/20 opacity-100 md:opacity-0 md:group-hover:opacity-100"
            )}
            aria-label={isSaved ? "Unsave" : "Save for later"}
          >
            {isSaved ? (
              <BookmarkCheck size={15} className="text-[var(--intent-amber)] fill-[var(--intent-amber)]" />
            ) : (
              <Bookmark size={15} className="text-white" />
            )}
          </button>
        )}

        {/* Signal icon cluster */}
        {signalIcons.length > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            {signalIcons.map((signal) => (
              <div
                key={signal.id}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full backdrop-blur-sm",
                  signal.signalType === "ASK"
                    ? "bg-[var(--intent-amber-subtle)]/90"
                    : "bg-[var(--intent-green-subtle)]/90"
                )}
                title={signal.displayName}
              >
                <SignalIcon
                  name={signal.icon}
                  size={12}
                  strokeWidth={2}
                  className={
                    signal.signalType === "ASK"
                      ? "text-[var(--intent-amber)]"
                      : "text-[var(--intent-green)]"
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5 p-4">
        {/* Name row */}
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-base font-semibold text-[var(--intent-text-primary)]">
            {member.fullName}
          </h3>
          {member.isVerified && (
            <CheckCircle2
              size={15}
              className="shrink-0 fill-[var(--intent-green)] text-white"
            />
          )}
          {isFounder && (
            <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--intent-green)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white">
              <Shield size={9} />
              Founder
            </span>
          )}
        </div>

        {/* Intent statement — lead element of identity */}
        {member.missionStatement && (
          <p className="line-clamp-2 border-l-2 border-[var(--intent-amber)]/40 pl-2.5 text-[13px] leading-relaxed text-[var(--intent-text-primary)]/80">
            {member.missionStatement}
          </p>
        )}

        {/* Compact metadata: company · domain · city */}
        {metaParts.length > 0 && (
          <div className="flex items-center gap-1.5 text-[12px] text-[var(--intent-text-secondary)]">
            {member.currentCompany && (
              <AvatarPlaceholder name={member.currentCompany} size={18} className="shrink-0" />
            )}
            <span className="truncate">
              {metaParts.join(" · ")}
            </span>
          </div>
        )}

        {/* Niche pills — max 2 + overflow */}
        {member.niches && member.niches.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {member.niches.slice(0, 2).map((niche) => (
              <span
                key={niche.id}
                className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--intent-text-secondary)]"
              >
                {niche.displayName}
              </span>
            ))}
            {member.niches.length > 2 && (
              <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--intent-text-secondary)]">
                +{member.niches.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
