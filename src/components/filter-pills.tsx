"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

interface FilterPill {
  label: string;
  value: string;
}

interface FilterPillsProps {
  pills: FilterPill[];
  activeValue: string;
  onSelect: (value: string) => void;
  className?: string;
}

export function FilterPills({
  pills,
  activeValue,
  onSelect,
  className,
}: FilterPillsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide md:px-0",
        className
      )}
    >
      {pills.map((pill) => {
        const isActive = pill.value === activeValue;
        return (
          <button
            key={pill.value}
            onClick={() => onSelect(pill.value)}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-4 py-1.5 text-[13px] font-medium transition-all",
              isActive
                ? "bg-[var(--intent-amber)] text-white shadow-sm"
                : "bg-[var(--intent-amber-subtle)] text-[var(--intent-text-primary)] hover:bg-[var(--intent-amber-subtle)]/80"
            )}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}
