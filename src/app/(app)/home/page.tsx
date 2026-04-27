"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import { useDiscovery, useDiscoveryFilters } from "@/hooks/use-discovery";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSavedUsers, useSaveUser, useUnsaveUser } from "@/hooks/use-saved-users";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { MemberCard } from "@/components/member-card";
import { FilterPills } from "@/components/filter-pills";
import { FilterDrawer } from "@/components/filter-drawer";
import { FeatureRequestDialog } from "@/components/feature-request-dialog";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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
      <div className="intent-skeleton h-[180px]" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="intent-skeleton h-5 w-3/4 rounded-md" />
        <div className="intent-skeleton h-10 w-full rounded-md" />
        <div className="intent-skeleton h-4 w-2/3 rounded-md" />
        <div className="flex gap-1">
          <div className="intent-skeleton h-5 w-14 rounded-full" />
          <div className="intent-skeleton h-5 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  // Build API filter params from the active pill
  const apiFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    if (debouncedSearch) filters.search = debouncedSearch;
    if (activeFilter.startsWith("year:")) filters.classYear = activeFilter.slice(5);
    else if (activeFilter.startsWith("city:")) filters.city = activeFilter.slice(5);
    else if (activeFilter.startsWith("domain:")) filters.domain = activeFilter.slice(7);
    else if (activeFilter.startsWith("niche:")) filters.niche = activeFilter.slice(6);
    return filters;
  }, [activeFilter, debouncedSearch]);

  const { data, isLoading, error } = useDiscovery({ ...apiFilters, pageSize: 20 });
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
      if (savedUserIds.has(userId)) {
        unsaveUser.mutate(userId);
      } else {
        saveUser.mutate(userId);
      }
    },
    [savedUserIds, saveUser, unsaveUser]
  );

  // Greeting
  const firstName = currentUser?.fullName?.split(" ")[0];
  const greeting = firstName ? `${getGreeting()}, ${firstName}` : "Discover";

  // Build filter pills dynamically
  const filterOptions = useMemo(() => {
    const pills = [{ label: "All", value: "all" }];
    if (filterData) {
      filterData.classYears.slice(0, 2).forEach((y) =>
        pills.push({ label: `Class of ${y}`, value: `year:${y}` })
      );
      filterData.cities.slice(0, 3).forEach((c) =>
        pills.push({ label: c, value: `city:${c}` })
      );
    } else {
      pills.push(
        { label: "Class of 2018", value: "year:2018" },
        { label: "Bangalore", value: "city:Bangalore" },
        { label: "Mumbai", value: "city:Mumbai" },
      );
    }
    return pills;
  }, [filterData]);

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Sticky header ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
          <div className="min-w-0">
            <h1 className="truncate font-heading text-lg font-bold tracking-tight text-[var(--intent-text-primary)]">
              {greeting}
            </h1>
            <p className="text-[11px] text-[var(--intent-text-secondary)]">
              Find your next meaningful connection
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <FeatureRequestDialog />
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--intent-text-tertiary)] bg-white transition-colors hover:bg-[var(--muted)]"
              aria-label="Search"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <FilterDrawer resultCount={members.length} />
          </div>
        </div>

        {searchOpen && (
          <div className="mx-auto max-w-[1200px] px-4 pb-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-3 py-2 transition-all">
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
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-[1200px]">
          <FilterPills
            pills={filterOptions}
            activeValue={activeFilter}
            onSelect={setActiveFilter}
          />
        </div>
      </header>

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
            {activeFilter !== "all" && (
              <button
                onClick={() => { setActiveFilter("all"); setSearchQuery(""); setDebouncedSearch(""); }}
                className="mt-4 rounded-full bg-[var(--intent-amber)] px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[var(--intent-amber-light)]"
              >
                Clear filters
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
