"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";
import { X } from "lucide-react";

interface FilterPill {
  label: string;
  value: string;
}

interface FilterPillsProps {
  pills: FilterPill[];
  activeValues: Set<string>;
  onToggle: (value: string) => void;
  onClearAll: () => void;
  /** Number of additional drawer-only filters active */
  extraFilterCount?: number;
  className?: string;
}

export function FilterPills({
  pills,
  activeValues,
  onToggle,
  onClearAll,
  extraFilterCount = 0,
  className,
}: FilterPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasAnyActive = activeValues.size > 0 || extraFilterCount > 0;

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex gap-2 overflow-x-auto px-4 py-2.5 scrollbar-hide md:px-0",
        className
      )}
    >
      {/* "All" pill — active when nothing selected */}
      <button
        onClick={onClearAll}
        className={cn(
          "inline-flex shrink-0 items-center rounded-full px-4 py-1.5 text-[13px] font-medium transition-all",
          !hasAnyActive
            ? "bg-[var(--intent-amber)] text-white shadow-sm"
            : "border border-[var(--intent-text-tertiary)] bg-white text-[var(--intent-text-primary)] hover:border-[var(--intent-amber)]/50"
        )}
      >
        All
      </button>

      {pills.map((pill) => {
        const isActive = activeValues.has(pill.value);
        return (
          <button
            key={pill.value}
            onClick={() => onToggle(pill.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-4 py-1.5 text-[13px] font-medium transition-all",
              isActive
                ? "bg-[var(--intent-amber)] text-white shadow-sm"
                : "border border-[var(--intent-text-tertiary)] bg-white text-[var(--intent-text-primary)] hover:border-[var(--intent-amber)]/50"
            )}
          >
            {pill.label}
            {isActive && <X size={12} strokeWidth={2.5} />}
          </button>
        );
      })}

      {/* Extra filter indicator */}
      {extraFilterCount > 0 && (
        <span className="inline-flex shrink-0 items-center rounded-full bg-[var(--intent-amber-subtle)] px-3 py-1.5 text-[12px] font-medium text-[var(--intent-amber)]">
          +{extraFilterCount} more
        </span>
      )}
    </div>
  );
}
