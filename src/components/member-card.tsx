"use client";

import Link from "next/link";
import { MapPin, ArrowDown, ArrowUp, CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroPlaceholder, AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Separator } from "@/components/ui/separator";
import type { SampleMember } from "@/data/sample-members";

interface MemberCardProps {
  member: SampleMember;
  className?: string;
}

export function MemberCard({ member, className }: MemberCardProps) {
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
        gradientFrom={member.gradientFrom}
        gradientTo={member.gradientTo}
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
              {member.isFounder && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--intent-green)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  <Shield size={10} />
                  Founder
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-[var(--intent-text-secondary)]">
              {member.yearsOfExperience} yrs &middot; Class of {member.classYear}
            </p>
          </div>
        </div>

        {/* Company badges */}
        <div className="flex items-center gap-1.5">
          <AvatarPlaceholder
            name={member.currentCompany}
            size={24}
            gradientFrom={member.gradientFrom}
            gradientTo={member.gradientTo}
          />
          <span className="text-[13px] font-medium text-[var(--intent-text-primary)]">
            {member.currentCompany}
          </span>
          {member.previousCompanies.map((co) => (
            <span key={co} className="flex items-center gap-1">
              <span className="text-[var(--intent-text-secondary)]">&rarr;</span>
              <AvatarPlaceholder name={co} size={20} />
              <span className="text-[12px] text-[var(--intent-text-secondary)]">
                {co}
              </span>
            </span>
          ))}
        </div>

        {/* Domain tag */}
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--intent-amber)]">
            {member.domain}
          </span>
        </div>

        {/* Niche pills */}
        <div className="flex flex-wrap gap-1.5">
          {member.niches.slice(0, 3).map((niche) => (
            <span
              key={niche}
              className="rounded-full bg-[var(--muted)] px-2.5 py-1 text-[11px] font-medium text-[var(--intent-text-secondary)]"
            >
              {niche}
            </span>
          ))}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-[13px] text-[var(--intent-text-secondary)]">
          <MapPin size={14} strokeWidth={1.5} />
          <span>{member.city}</span>
        </div>

        {/* Intent statement */}
        <p className="text-[14px] italic leading-relaxed text-[var(--intent-text-secondary)]">
          &ldquo;{member.intent}&rdquo;
        </p>

        {/* Divider */}
        <Separator className="bg-[var(--intent-text-tertiary)]" />

        {/* Asks / Offers row */}
        <div className="flex items-center gap-4">
          {member.asks > 0 && (
            <div className="flex items-center gap-1 text-[13px] font-medium">
              <ArrowDown
                size={14}
                strokeWidth={2}
                className="text-[var(--intent-amber)]"
              />
              <span className="text-[var(--intent-amber)]">
                {member.asks} {member.asks === 1 ? "Ask" : "Asks"}
              </span>
            </div>
          )}
          {member.offers > 0 && (
            <div className="flex items-center gap-1 text-[13px] font-medium">
              <ArrowUp
                size={14}
                strokeWidth={2}
                className="text-[var(--intent-green)]"
              />
              <span className="text-[var(--intent-green)]">
                {member.offers} {member.offers === 1 ? "Offer" : "Offers"}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
