"use client";

import { useState } from "react";
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
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Filter option data                                                  */
/* ------------------------------------------------------------------ */

const domains = [
  "Climate Investing",
  "Fintech",
  "Finance",
  "VC/PE",
  "Strategy & Consulting",
  "Tech/Product",
  "Healthcare",
  "E-Commerce",
];

const niches = [
  "Climate Tech",
  "Venture Capital",
  "Impact Investing",
  "Fraud Detection",
  "Lending",
  "Investment Banking",
  "SaaS",
  "Product Management",
];

const cities = [
  "Bangalore",
  "Mumbai",
  "Hyderabad",
  "Delhi",
  "Chennai",
  "Pune",
];

const classYears = [
  "2010",
  "2012",
  "2014",
  "2016",
  "2018",
  "2020",
  "2022",
  "2024",
  "2026",
];

/* ------------------------------------------------------------------ */
/* Pill selector reusable component                                    */
/* ------------------------------------------------------------------ */

function PillGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
        {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected.has(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] font-medium transition-all",
                isActive
                  ? "bg-[var(--intent-amber)] text-white shadow-sm"
                  : "bg-[var(--intent-amber-subtle)] text-[var(--intent-text-primary)] hover:bg-[var(--intent-amber-subtle)]/80"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toggle row for boolean filters                                      */
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
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            className="text-white"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
  /** Number of results matching current filters */
  resultCount?: number;
  children?: React.ReactNode;
}

export function FilterDrawer({
  resultCount = 5,
  children,
}: FilterDrawerProps) {
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
    new Set()
  );
  const [selectedNiches, setSelectedNiches] = useState<Set<string>>(
    new Set()
  );
  const [selectedCities, setSelectedCities] = useState<Set<string>>(
    new Set()
  );
  const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set());
  const [asksOpen, setAsksOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);

  const totalFilters =
    selectedDomains.size +
    selectedNiches.size +
    selectedCities.size +
    selectedYears.size +
    (asksOpen ? 1 : 0) +
    (offersOpen ? 1 : 0);

  function toggleInSet(
    set: Set<string>,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    value: string
  ) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function clearAll() {
    setSelectedDomains(new Set());
    setSelectedNiches(new Set());
    setSelectedCities(new Set());
    setSelectedYears(new Set());
    setAsksOpen(false);
    setOffersOpen(false);
  }

  return (
    <Sheet>
      <SheetTrigger
        render={
          children ? undefined : (
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--intent-text-tertiary)] bg-white transition-colors hover:bg-[var(--muted)]">
              <SlidersHorizontal size={18} strokeWidth={1.5} />
              {totalFilters > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--intent-amber)] text-[9px] font-bold text-white">
                  {totalFilters}
                </span>
              )}
            </button>
          )
        }
      >
        {children}
      </SheetTrigger>

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
          {totalFilters > 0 && (
            <button
              onClick={clearAll}
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
            options={domains}
            selected={selectedDomains}
            onToggle={(v) =>
              toggleInSet(selectedDomains, setSelectedDomains, v)
            }
          />

          <PillGroup
            label="Niche"
            options={niches}
            selected={selectedNiches}
            onToggle={(v) =>
              toggleInSet(selectedNiches, setSelectedNiches, v)
            }
          />

          <PillGroup
            label="Class Year"
            options={classYears}
            selected={selectedYears}
            onToggle={(v) =>
              toggleInSet(selectedYears, setSelectedYears, v)
            }
          />

          <PillGroup
            label="City"
            options={cities}
            selected={selectedCities}
            onToggle={(v) =>
              toggleInSet(selectedCities, setSelectedCities, v)
            }
          />

          <div className="space-y-2">
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Signals
            </h4>
            <div className="space-y-2">
              <ToggleRow
                label="Has open Asks"
                description="Show members who are looking for help"
                active={asksOpen}
                onToggle={() => setAsksOpen(!asksOpen)}
              />
              <ToggleRow
                label="Has open Offers"
                description="Show members who are offering help"
                active={offersOpen}
                onToggle={() => setOffersOpen(!offersOpen)}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="border-t border-[var(--intent-text-tertiary)] bg-white px-4 py-4">
          <SheetClose
            render={
              <Button
                className="h-12 w-full rounded-xl bg-[var(--intent-amber)] text-[15px] font-semibold text-white hover:bg-[var(--intent-amber-light)]"
              />
            }
          >
            Show {resultCount} results
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
