"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Search, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDiscovery, useDiscoveryFilters } from "@/hooks/use-discovery";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSavedUsers, useSaveUser, useUnsaveUser } from "@/hooks/use-saved-users";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { MemberCard } from "@/components/member-card";
import { FilterPills } from "@/components/filter-pills";
import {
  FilterDrawer,
  type DrawerFilterState,
  EMPTY_FILTERS,
  filtersToApiParams,
  countActiveFilters,
} from "@/components/filter-drawer";
import { IntentWordmark } from "@/components/intent-wordmark";
import { FeatureRequestDialog } from "@/components/feature-request-dialog";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function AnimatedCard({ children, index }: { children: React.ReactNode; index: number }) {
  const { ref, isVisible } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className="transition-all duration-500 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(16px)",
        transitionDelay: `${(index % 3) * 80}ms`,
      }}
    >
      {children}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="intent-card overflow-hidden rounded-2xl">
      <div className="intent-skeleton h-[240px]" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="intent-skeleton h-5 w-3/4 rounded-md" />
        <div className="intent-skeleton h-3 w-1/2 rounded-md" />
        <div className="flex items-center gap-2">
          <div className="intent-skeleton h-6 w-6 rounded-full" />
          <div className="intent-skeleton h-3 w-32 rounded-md" />
        </div>
        <div className="intent-skeleton h-3 w-24 rounded-md" />
        <div className="flex gap-1.5">
          <div className="intent-skeleton h-5 w-16 rounded-full" />
          <div className="intent-skeleton h-5 w-16 rounded-full" />
          <div className="intent-skeleton h-5 w-16 rounded-full" />
        </div>
        <div className="intent-skeleton h-10 w-full rounded-md" />
        <div className="intent-skeleton mt-1 h-4 w-1/3 rounded-md" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  // Unified filter state
  const [filters, setFilters] = useState<DrawerFilterState>(EMPTY_FILTERS);

  // Build API params from filter state + search
  const apiFilters = useMemo(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    Object.assign(params, filtersToApiParams(filters));
    return { ...params, pageSize: 20 };
  }, [filters, debouncedSearch]);

  const { data, isLoading, error } = useDiscovery(apiFilters);
  const { data: filterData } = useDiscoveryFilters();
  const { data: currentUser } = useCurrentUser();
  const { data: savedData } = useSavedUsers();
  const saveUser = useSaveUser();
  const unsaveUser = useUnsaveUser();

  const members = data?.members ?? [];

  const savedUserIds = useMemo(
    () => new Set(savedData?.items.map((item) => item.savedUser.id) ?? []),
    [savedData]
  );

  const handleToggleSave = useCallback(
    (userId: string) => {
      if (savedUserIds.has(userId)) unsaveUser.mutate(userId);
      else saveUser.mutate(userId);
    },
    [savedUserIds, saveUser, unsaveUser]
  );

  // Greeting for subtitle
  const firstName = currentUser?.fullName?.split(" ")[0];

  // Quick-access pills: top cities + class years from API
  const quickPills = useMemo(() => {
    const pills: { label: string; value: string }[] = [];
    if (filterData) {
      filterData.classYears.slice(0, 3).forEach((y) =>
        pills.push({ label: `Class of ${y}`, value: `year:${y}` })
      );
      filterData.cities.slice(0, 3).forEach((c) =>
        pills.push({ label: c, value: `city:${c}` })
      );
    }
    return pills;
  }, [filterData]);

  // Map quick pill values into the filter state
  const activePillValues = useMemo(() => {
    const active = new Set<string>();
    filters.classYears.forEach((y) => active.add(`year:${y}`));
    filters.cities.forEach((c) => active.add(`city:${c}`));
    return active;
  }, [filters]);

  // Count drawer-only filters (domains, niches, hasAsks, hasOffers) that aren't in quick pills
  const extraFilterCount = filters.domains.size + filters.niches.size + (filters.hasAsks ? 1 : 0) + (filters.hasOffers ? 1 : 0);

  const handlePillToggle = useCallback((value: string) => {
    setFilters((prev) => {
      const next = {
        ...prev,
        domains: new Set(prev.domains),
        niches: new Set(prev.niches),
        cities: new Set(prev.cities),
        classYears: new Set(prev.classYears),
      };

      if (value.startsWith("year:")) {
        const year = value.slice(5);
        if (next.classYears.has(year)) next.classYears.delete(year);
        else next.classYears.add(year);
      } else if (value.startsWith("city:")) {
        const city = value.slice(5);
        if (next.cities.has(city)) next.cities.delete(city);
        else next.cities.add(city);
      }

      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setSearchQuery("");
    setDebouncedSearch("");
  }, []);

  const totalActiveFilters = countActiveFilters(filters);

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
          <div className="min-w-0">
            <IntentWordmark size="sm" />
            {firstName && (
              <p className="text-[11px] text-[var(--intent-text-secondary)]">
                Welcome back, {firstName}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <FeatureRequestDialog />
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                searchOpen
                  ? "border-[var(--intent-amber)] bg-[var(--intent-amber-subtle)]"
                  : "border-[var(--intent-text-tertiary)] bg-white hover:bg-[var(--muted)]"
              )}
              aria-label="Search"
            >
              {searchOpen ? (
                <X size={18} strokeWidth={1.5} className="text-[var(--intent-amber)]" />
              ) : (
                <Search size={18} strokeWidth={1.5} />
              )}
            </button>
            <FilterDrawer
              filters={filters}
              onApply={setFilters}
              onClear={handleClearAll}
            />
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="mx-auto max-w-[1200px] px-4 pb-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-3 py-2 transition-all focus-within:border-[var(--intent-amber)] focus-within:ring-2 focus-within:ring-[var(--intent-amber)]/20">
              <Search size={16} className="shrink-0 text-[var(--intent-text-secondary)]" />
              <input
                type="text"
                placeholder="Search by name, domain, city..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 bg-transparent text-[14px] text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)] outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }}
                  className="text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filter pills */}
        <div className="mx-auto max-w-[1200px]">
          <FilterPills
            pills={quickPills}
            activeValues={activePillValues}
            onToggle={handlePillToggle}
            onClearAll={handleClearAll}
            extraFilterCount={extraFilterCount}
          />
        </div>
      </header>

      {/* ── Active filter summary ──────────────────────────────────── */}
      {totalActiveFilters > 0 && (
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 pt-3">
          <p className="text-[13px] text-[var(--intent-text-secondary)]">
            {data ? `${data.total} member${data.total === 1 ? "" : "s"} found` : "Filtering..."}
          </p>
          <button
            onClick={handleClearAll}
            className="text-[13px] font-medium text-[var(--intent-amber)] hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Card grid ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1200px] px-4 py-4 md:py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-[14px] text-[var(--intent-text-secondary)]">
              Failed to load members. Please try again.
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--intent-amber-subtle)]">
              <Users size={28} className="text-[var(--intent-amber)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--intent-text-primary)]">
              No members found
            </h3>
            <p className="mt-1 max-w-xs text-[14px] text-[var(--intent-text-secondary)]">
              We couldn&apos;t find anyone matching those filters. Try broadening your search.
            </p>
            {totalActiveFilters > 0 && (
              <button
                onClick={handleClearAll}
                className="mt-4 rounded-full bg-[var(--intent-amber)] px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--intent-amber-light)]"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
            {members.map((member, index) => (
              <AnimatedCard key={member.id} index={index}>
                <MemberCard
                  member={member}
                  isSaved={savedUserIds.has(member.id)}
                  onToggleSave={handleToggleSave}
                />
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
