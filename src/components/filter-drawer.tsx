"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDiscoveryFilters, useDiscovery } from "@/hooks/use-discovery";

/* ------------------------------------------------------------------ */
/* Filter state type                                                   */
/* ------------------------------------------------------------------ */

export interface DrawerFilterState {
  domains: Set<string>;
  niches: Set<string>;
  cities: Set<string>;
  classYears: Set<string>;
  hasAsks: boolean;
  hasOffers: boolean;
}

export const EMPTY_FILTERS: DrawerFilterState = {
  domains: new Set(),
  niches: new Set(),
  cities: new Set(),
  classYears: new Set(),
  hasAsks: false,
  hasOffers: false,
};

export function countActiveFilters(f: DrawerFilterState): number {
  return (
    f.domains.size +
    f.niches.size +
    f.cities.size +
    f.classYears.size +
    (f.hasAsks ? 1 : 0) +
    (f.hasOffers ? 1 : 0)
  );
}

export function filtersToApiParams(f: DrawerFilterState): Record<string, string> {
  const p: Record<string, string> = {};
  if (f.domains.size) p.domain = Array.from(f.domains).join(",");
  if (f.niches.size) p.niche = Array.from(f.niches).join(",");
  if (f.cities.size) p.city = Array.from(f.cities).join(",");
  if (f.classYears.size) p.classYear = Array.from(f.classYears).join(",");
  if (f.hasAsks) p.hasAsks = "true";
  if (f.hasOffers) p.hasOffers = "true";
  return p;
}

/* ------------------------------------------------------------------ */
/* Pill selector                                                       */
/* ------------------------------------------------------------------ */

interface PillOption {
  label: string;
  value: string;
}

function PillGroup({
  label,
  options,
  selected,
  onToggle,
  isLoading,
}: {
  label: string;
  options: PillOption[];
  selected: Set<string>;
  onToggle: (value: string) => void;
  isLoading?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
        {label}
      </h4>
      {isLoading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin text-[var(--intent-text-secondary)]" />
          <span className="text-[13px] text-[var(--intent-text-secondary)]">Loading...</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const isActive = selected.has(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => onToggle(opt.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all",
                  isActive
                    ? "bg-[var(--intent-amber)] text-white shadow-sm"
                    : "border border-[var(--intent-text-tertiary)] bg-white text-[var(--intent-text-primary)] hover:border-[var(--intent-amber)]/50 hover:bg-[var(--intent-amber-subtle)]/50"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toggle row                                                          */
/* ------------------------------------------------------------------ */

function ToggleRow({
  label,
  description,
  active,
  onToggle,
}: {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all",
        active
          ? "border-[var(--intent-amber)] bg-[var(--intent-amber-subtle)]"
          : "border-[var(--intent-text-tertiary)] bg-white hover:bg-[var(--muted)]"
      )}
    >
      <div>
        <p className="text-[14px] font-medium text-[var(--intent-text-primary)]">
          {label}
        </p>
        <p className="text-[12px] text-[var(--intent-text-secondary)]">
          {description}
        </p>
      </div>
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          active
            ? "border-[var(--intent-amber)] bg-[var(--intent-amber)]"
            : "border-[var(--intent-text-tertiary)]"
        )}
      >
        {active && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Main filter drawer                                                  */
/* ------------------------------------------------------------------ */

interface FilterDrawerProps {
  filters: DrawerFilterState;
  onApply: (filters: DrawerFilterState) => void;
  onClear: () => void;
}

function toggleInSet(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export function FilterDrawer({ filters, onApply, onClear }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);

  // Local draft state — copied from props on open
  const [draft, setDraft] = useState<DrawerFilterState>(filters);

  // Sync draft from props when drawer opens
  useEffect(() => {
    if (open) {
      setDraft({
        domains: new Set(filters.domains),
        niches: new Set(filters.niches),
        cities: new Set(filters.cities),
        classYears: new Set(filters.classYears),
        hasAsks: filters.hasAsks,
        hasOffers: filters.hasOffers,
      });
    }
  }, [open, filters]);

  // Load real filter options from API
  const { data: filterOptions, isLoading: filtersLoading } = useDiscoveryFilters();

  const domainOptions = useMemo<PillOption[]>(
    () => filterOptions?.domains.map((d) => ({ label: d.displayName, value: d.code })) ?? [],
    [filterOptions]
  );
  const nicheOptions = useMemo<PillOption[]>(
    () => filterOptions?.niches.map((n) => ({ label: n.displayName, value: n.code })) ?? [],
    [filterOptions]
  );
  const cityOptions = useMemo<PillOption[]>(
    () => filterOptions?.cities.map((c) => ({ label: c, value: c })) ?? [],
    [filterOptions]
  );
  const yearOptions = useMemo<PillOption[]>(
    () => filterOptions?.classYears.map((y) => ({ label: `Class of ${y}`, value: String(y) })) ?? [],
    [filterOptions]
  );

  // Live preview count
  const previewApiParams = useMemo(() => ({
    ...filtersToApiParams(draft),
    pageSize: 1,
  }), [draft]);

  const { data: previewData, isFetching: previewFetching } = useDiscovery(
    open ? previewApiParams : {}
  );
  const liveCount = open ? (previewData?.total ?? null) : null;

  const draftCount = countActiveFilters(draft);

  const handleApply = useCallback(() => {
    onApply(draft);
    setOpen(false);
  }, [draft, onApply]);

  const handleClear = useCallback(() => {
    const empty = {
      domains: new Set<string>(),
      niches: new Set<string>(),
      cities: new Set<string>(),
      classYears: new Set<string>(),
      hasAsks: false,
      hasOffers: false,
    };
    setDraft(empty);
    onClear();
  }, [onClear]);

  const activeCount = countActiveFilters(filters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--intent-text-tertiary)] bg-white transition-colors hover:bg-[var(--muted)]">
            <SlidersHorizontal size={18} strokeWidth={1.5} />
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--intent-amber)] text-[9px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        }
      />

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[85vh] rounded-t-3xl"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-[var(--intent-text-tertiary)]" />
        </div>

        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="text-lg font-semibold">Filters</SheetTitle>
          <SheetDescription className="sr-only">
            Filter members in the discovery feed
          </SheetDescription>
          {draftCount > 0 && (
            <button
              onClick={handleClear}
              className="text-[13px] font-medium text-[var(--intent-amber)] hover:underline"
            >
              Clear all
            </button>
          )}
        </SheetHeader>

        {/* Scrollable filter body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <PillGroup
            label="Domain"
            options={domainOptions}
            selected={draft.domains}
            onToggle={(v) => setDraft((d) => ({ ...d, domains: toggleInSet(d.domains, v) }))}
            isLoading={filtersLoading}
          />

          <PillGroup
            label="Niche"
            options={nicheOptions}
            selected={draft.niches}
            onToggle={(v) => setDraft((d) => ({ ...d, niches: toggleInSet(d.niches, v) }))}
            isLoading={filtersLoading}
          />

          <PillGroup
            label="Class Year"
            options={yearOptions}
            selected={draft.classYears}
            onToggle={(v) => setDraft((d) => ({ ...d, classYears: toggleInSet(d.classYears, v) }))}
            isLoading={filtersLoading}
          />

          <PillGroup
            label="City"
            options={cityOptions}
            selected={draft.cities}
            onToggle={(v) => setDraft((d) => ({ ...d, cities: toggleInSet(d.cities, v) }))}
            isLoading={filtersLoading}
          />

          <div className="space-y-2.5">
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Signals
            </h4>
            <div className="space-y-2">
              <ToggleRow
                label="Has open Asks"
                description="Show members who are looking for help"
                active={draft.hasAsks}
                onToggle={() => setDraft((d) => ({ ...d, hasAsks: !d.hasAsks }))}
              />
              <ToggleRow
                label="Has open Offers"
                description="Show members who are offering help"
                active={draft.hasOffers}
                onToggle={() => setDraft((d) => ({ ...d, hasOffers: !d.hasOffers }))}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-[var(--intent-text-tertiary)] bg-white px-4 py-4">
          <div className="flex w-full gap-3">
            <SheetClose
              render={
                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-xl border-[var(--intent-text-tertiary)] text-[15px] font-medium"
                />
              }
            >
              Cancel
            </SheetClose>
            <Button
              onClick={handleApply}
              className="h-12 flex-1 rounded-xl bg-[var(--intent-amber)] text-[15px] font-semibold text-white hover:bg-[var(--intent-amber-light)]"
            >
              {previewFetching ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : null}
              {liveCount !== null ? `Show ${liveCount} results` : "Apply filters"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
