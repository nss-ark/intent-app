"use client";

import { cn } from "@/lib/utils";

export interface SignalPillData {
  id: string;
  code: string;
  displayName: string;
  signalType: "ask" | "offer" | "mutual";
  icon?: string;
}

interface SignalPillProps {
  signal: SignalPillData;
  isSelected?: boolean;
  onClick?: (signal: SignalPillData) => void;
  className?: string;
}

export function SignalPill({
  signal,
  isSelected = false,
  onClick,
  className,
}: SignalPillProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(signal)}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium",
        "transition-all duration-150 border select-none",
        isSelected
          ? "bg-[#1B3A5F] text-white border-[#1B3A5F]"
          : "bg-white text-[#1A1A1A] border-[#D8DCE5] hover:border-[#1B3A5F]/50 hover:bg-[#E8EFF7]/50",
        className
      )}
    >
      {signal.signalType === "ask" && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <polyline points="7 7 12 12 17 7" />
          <polyline points="7 13 12 18 17 13" />
        </svg>
      )}
      {signal.signalType === "offer" && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <polyline points="17 17 12 12 7 17" />
          <polyline points="17 11 12 6 7 11" />
        </svg>
      )}
      {signal.signalType === "mutual" && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <path d="M17 1l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      )}
      <span className="leading-tight">{signal.displayName}</span>
    </button>
  );
}
