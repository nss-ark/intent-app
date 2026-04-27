"use client";

import Link from "next/link";
import { MapPin, ArrowDown, ArrowUp, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroPlaceholder, AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Separator } from "@/components/ui/separator";
import type { DiscoveryMember } from "@/hooks/use-discovery";

interface MemberCardProps {
  member: DiscoveryMember;
  className?: string;
}

export function MemberCard({ member, className }: MemberCardProps) {
  const asks = member.openSignals?.filter((s) => s.signalType === "ASK").length ?? 0;
  const offers = member.openSignals?.filter((s) => s.signalType === "OFFER" || s.signalType === "MUTUAL").length ?? 0;
  const isFounder = member.badges?.some((b) => b.displayName?.toLowerCase().includes("founder")) ?? false;

  return (
    <Link
      href={`/profile/${member.id}`}
      className={cn(
        "intent-card group block overflow-hidden rounded-2xl transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      {/* Photo area */}
      <HeroPlaceholder
        name={member.fullName}
        minHeight={220}
        className="rounded-t-2xl"
      />

      {/* Content */}
      <div className="flex flex-col gap-3 p-4">
        {/* Name row */}
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-[var(--intent-text-primary)]">
                {member.fullName}
              </h3>
              {member.isVerified && (
                <CheckCircle2
                  size={16}
                  className="shrink-0 fill-[var(--intent-green)] text-white"
                />
              )}
              {isFounder && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--intent-green)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  <Shield size={10} />
                  Founder
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-[var(--intent-text-secondary)]">
              {member.yearsOfExperience} yrs &middot; Class of {member.graduationYear}
            </p>
          </div>
        </div>

        {/* Company badge */}
        {member.currentCompany && (
          <div className="flex items-center gap-1.5">
            <AvatarPlaceholder name={member.currentCompany} size={24} />
            <span className="text-[13px] font-medium text-[var(--intent-text-primary)]">
              {member.currentCompany}
            </span>
          </div>
        )}

        {/* Domain tag */}
        {member.domain && (
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--intent-amber)]">
              {member.domain.displayName}
            </span>
          </div>
        )}

        {/* Niche pills */}
        <div className="flex flex-wrap gap-1.5">
          {member.niches?.slice(0, 3).map((niche) => (
            <span
              key={niche.id}
              className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--intent-text-secondary)]"
            >
              {niche.displayName}
            </span>
          ))}
        </div>

        {/* Location */}
        {member.currentCity && (
          <div className="flex items-center gap-1 text-[13px] text-[var(--intent-text-secondary)]">
            <MapPin size={14} strokeWidth={1.5} />
            <span>{member.currentCity}</span>
          </div>
        )}

        {/* Intent statement */}
        {member.missionStatement && (
          <p className="text-[14px] italic leading-relaxed text-[var(--intent-text-secondary)]">
            &ldquo;{member.missionStatement}&rdquo;
          </p>
        )}

        {/* Divider */}
        <Separator className="bg-[var(--intent-text-tertiary)]" />

        {/* Asks / Offers row */}
        <div className="flex items-center gap-4">
          {asks > 0 && (
            <div className="flex items-center gap-1 text-[13px] font-medium">
              <ArrowDown size={14} strokeWidth={2} className="text-[var(--intent-amber)]" />
              <span className="text-[var(--intent-amber)]">
                {asks} {asks === 1 ? "Ask" : "Asks"}
              </span>
            </div>
          )}
          {offers > 0 && (
            <div className="flex items-center gap-1 text-[13px] font-medium">
              <ArrowUp size={14} strokeWidth={2} className="text-[var(--intent-green)]" />
              <span className="text-[var(--intent-green)]">
                {offers} {offers === 1 ? "Offer" : "Offers"}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
