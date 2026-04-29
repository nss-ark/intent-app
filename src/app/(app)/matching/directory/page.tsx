"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Search,
  MapPin,
  Send,
  X,
  Users,
} from "lucide-react";
import { useDiscovery, useDiscoveryFilters, type DiscoveryMember } from "@/hooks/use-discovery";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { cn, truncate } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Debounce hook                                                       */
/* ------------------------------------------------------------------ */

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ------------------------------------------------------------------ */
/* Filter pill                                                         */
/* ------------------------------------------------------------------ */

function FilterPill({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all",
        isActive
          ? "bg-[var(--intent-navy)] text-white"
          : "border border-[var(--intent-text-tertiary)] bg-white text-[var(--intent-text-primary)] hover:border-[var(--intent-navy)]/50"
      )}
    >
      {label}
      {isActive && <X size={12} />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* User card                                                           */
/* ------------------------------------------------------------------ */

function UserCard({ member }: { member: DiscoveryMember }) {
  const router = useRouter();

  return (
    <div
      className="flex flex-col rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4 transition-shadow hover:shadow-[var(--card-shadow)]"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/profile/${member.id}`)}
      onKeyDown={(e) => e.key === "Enter" && router.push(`/profile/${member.id}`)}
    >
      <div className="flex items-start gap-3">
        <AvatarPlaceholder name={member.fullName} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[var(--intent-text-primary)]">
            {member.fullName}
          </p>
          {member.domain && (
            <p className="truncate text-[13px] text-[var(--intent-text-secondary)]">
              {member.domain.displayName}
            </p>
          )}
          {member.currentCity && (
            <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[var(--intent-text-secondary)]">
              <MapPin size={11} />
              {member.currentCity}
            </p>
          )}
        </div>
      </div>

      {member.missionStatement && (
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--intent-text-secondary)]">
          {truncate(member.missionStatement, 100)}
        </p>
      )}

      {/* Nudge button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/matching/nudge/${member.id}`);
        }}
        className="mt-3 flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[var(--intent-navy)] text-[12px] font-semibold text-[var(--intent-navy)] transition-colors hover:bg-[var(--intent-navy-subtle)]"
      >
        <Send size={12} />
        Send Nudge
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Skeleton grid                                                       */
/* ------------------------------------------------------------------ */

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 shrink-0 rounded-full bg-[var(--intent-text-tertiary)]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 rounded bg-[var(--intent-text-tertiary)]" />
              <div className="h-3 w-20 rounded bg-[var(--intent-text-tertiary)]" />
            </div>
          </div>
          <div className="mt-3 h-10 rounded bg-[var(--intent-text-tertiary)]" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function DirectoryPage() {
  const router = useRouter();

  // Search and filter state
  const [searchInput, setSearchInput] = useState("");
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [activeNiche, setActiveNiche] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 300);

  // Fetch filter options
  const { data: filterOptions } = useDiscoveryFilters();

  // Fetch members
  const { data, isLoading } = useDiscovery({
    search: debouncedSearch || undefined,
    domain: activeDomain || undefined,
    niche: activeNiche || undefined,
    city: activeCity || undefined,
    pageSize: 30,
  });

  const members = data?.members ?? [];
  const total = data?.total ?? 0;

  const toggleDomain = useCallback((id: string) => {
    setActiveDomain((prev) => (prev === id ? null : id));
  }, []);
  const toggleNiche = useCallback((id: string) => {
    setActiveNiche((prev) => (prev === id ? null : id));
  }, []);
  const toggleCity = useCallback((city: string) => {
    setActiveCity((prev) => (prev === city ? null : city));
  }, []);

  const hasActiveFilters = activeDomain || activeNiche || activeCity;

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-[var(--intent-text-tertiary)] bg-white/95 backdrop-blur-md safe-top">
        <div className="mx-auto flex h-14 max-w-[640px] items-center px-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={1.5} className="text-[var(--intent-text-primary)]" />
          </button>
          <h1 className="ml-2 text-[16px] font-semibold text-[var(--intent-text-primary)]">
            Find People
          </h1>
        </div>

        {/* Search bar */}
        <div className="mx-auto max-w-[640px] px-4 pb-3">
          <div className="relative">
            <Search
              size={18}
              strokeWidth={1.5}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--intent-text-secondary)]"
            />
            <input
              type="text"
              placeholder="Search by name, company, role..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 w-full rounded-xl border border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)] pl-10 pr-4 text-[14px] text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)]/60 outline-none transition-colors focus:border-[var(--intent-navy)] focus:ring-2 focus:ring-[var(--intent-navy)]/20"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div className="mx-auto max-w-[640px] overflow-x-auto px-4 pb-3 scrollbar-hide">
          <div className="flex gap-2">
            {/* Domain filters */}
            {filterOptions?.domains.slice(0, 5).map((d) => (
              <FilterPill
                key={d.id}
                label={d.displayName}
                isActive={activeDomain === d.id}
                onClick={() => toggleDomain(d.id)}
              />
            ))}
            {/* Niche filters */}
            {filterOptions?.niches.slice(0, 4).map((n) => (
              <FilterPill
                key={n.id}
                label={n.displayName}
                isActive={activeNiche === n.id}
                onClick={() => toggleNiche(n.id)}
              />
            ))}
            {/* City filters */}
            {filterOptions?.cities.slice(0, 4).map((c) => (
              <FilterPill
                key={c}
                label={c}
                isActive={activeCity === c}
                onClick={() => toggleCity(c)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pb-32 pt-4">
        {/* Result count */}
        {!isLoading && (
          <p className="mb-3 text-[13px] text-[var(--intent-text-secondary)]">
            {total} {total === 1 ? "person" : "people"} found
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setActiveDomain(null);
                  setActiveNiche(null);
                  setActiveCity(null);
                }}
                className="ml-2 text-[var(--intent-navy)] hover:underline"
              >
                Clear filters
              </button>
            )}
          </p>
        )}

        {isLoading ? (
          <SkeletonGrid />
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
              <Users size={28} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
            </div>
            <p className="mt-4 text-[15px] font-medium text-[var(--intent-text-primary)]">
              No people found
            </p>
            <p className="mt-1 text-center text-[13px] text-[var(--intent-text-secondary)]">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <UserCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
