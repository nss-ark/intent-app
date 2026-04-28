"use client";

import Link from "next/link";
import {
  MapPin,
  CheckCircle2,
  Shield,
  Bookmark,
  BookmarkCheck,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroPlaceholder, AvatarPlaceholder } from "@/components/avatar-placeholder";
import type { DiscoveryMember } from "@/hooks/use-discovery";

interface MemberCardProps {
  member: DiscoveryMember;
  isSaved?: boolean;
  onToggleSave?: (userId: string) => void;
  className?: string;
}

export function MemberCard({ member, isSaved, onToggleSave, className }: MemberCardProps) {
  const isFounder = member.badges?.some((b) => b.displayName?.toLowerCase().includes("founder")) ?? false;

  // Counts for asks/offers
  const askCount = member.openSignals?.filter((s) => s.signalType === "ASK").length ?? 0;
  const offerCount = member.openSignals?.filter((s) => s.signalType === "OFFER").length ?? 0;
  const mutualCount = member.openSignals?.filter((s) => s.signalType === "MUTUAL").length ?? 0;

  // Current experience
  const currentExp = member.currentCompany;

  // Meta parts: "X years · Class of YYYY"
  const metaParts: string[] = [];
  if (member.yearsOfExperience != null && member.yearsOfExperience > 0) {
    metaParts.push(`${member.yearsOfExperience} years`);
  }
  if (member.graduationYear) {
    metaParts.push(`Class of ${member.graduationYear}`);
  }

  return (
    <Link
      href={`/profile/${member.id}`}
      className={cn(
        "intent-card group block overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {/* ── Hero area ────────────────────────────────────────── */}
      <div className="relative">
        <HeroPlaceholder
          name={member.fullName}
          minHeight={240}
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
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 p-4">
        {/* Name + verified + founder */}
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-[17px] font-semibold leading-tight text-[var(--intent-text-primary)]">
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

        {/* Meta row: years · class year */}
        {metaParts.length > 0 && (
          <p className="text-[13px] text-[var(--intent-text-secondary)]">
            {metaParts.join(" · ")}
          </p>
        )}

        {/* Company monogram row */}
        {currentExp && (
          <div className="flex items-center gap-2">
            <AvatarPlaceholder name={currentExp} size={24} />
            <span className="truncate text-[13px] font-medium text-[var(--intent-text-primary)]">
              {currentExp}
            </span>
          </div>
        )}

        {/* Domain tag in amber small-caps */}
        {member.domain && (
          <span className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[var(--intent-amber)]">
            {member.domain.displayName}
          </span>
        )}

        {/* Niche pills — white bg + border per spec */}
        {member.niches && member.niches.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {member.niches.slice(0, 3).map((niche) => (
              <span
                key={niche.id}
                className="rounded-full border border-[var(--intent-text-tertiary)] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[var(--intent-text-primary)]"
              >
                {niche.displayName}
              </span>
            ))}
            {member.niches.length > 3 && (
              <span className="rounded-full border border-[var(--intent-text-tertiary)] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[var(--intent-text-secondary)]">
                +{member.niches.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Location with MapPin */}
        {member.currentCity && (
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--intent-text-secondary)]">
            <MapPin size={13} strokeWidth={1.5} className="shrink-0" />
            <span>{member.currentCity}</span>
          </div>
        )}

        {/* Intent statement — lead element of identity */}
        {member.missionStatement && (
          <p className="line-clamp-2 border-l-2 border-[var(--intent-amber)]/40 pl-2.5 text-[14px] italic leading-relaxed text-[var(--intent-text-primary)]">
            {member.missionStatement}
          </p>
        )}

        {/* Asks / Offers indicators */}
        {(askCount > 0 || offerCount > 0 || mutualCount > 0) && (
          <div className="mt-0.5 flex items-center gap-3 border-t border-[var(--intent-text-tertiary)] pt-2.5 text-[13px] font-medium">
            {askCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[var(--intent-amber)]">
                <ArrowDown size={13} strokeWidth={2} />
                {askCount} {askCount === 1 ? "Ask" : "Asks"}
              </span>
            )}
            {offerCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[var(--intent-green)]">
                <ArrowUp size={13} strokeWidth={2} />
                {offerCount} {offerCount === 1 ? "Offer" : "Offers"}
              </span>
            )}
            {mutualCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[var(--intent-text-secondary)]">
                {mutualCount} Mutual
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
