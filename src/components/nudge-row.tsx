"use client";

import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

export interface NudgeRowProps {
  id: string;
  senderName: string;
  senderPhotoUrl?: string | null;
  senderBadge?: string | null;
  signal: string;
  messagePreview: string;
  timestamp: string;
  isRead: boolean;
  onClick?: (id: string) => void;
  className?: string;
}

export function NudgeRow({
  id,
  senderName,
  senderPhotoUrl,
  senderBadge,
  signal,
  messagePreview,
  timestamp,
  isRead,
  onClick,
  className,
}: NudgeRowProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(id)}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors",
        "hover:bg-[#F5EDE0]/40 active:bg-[#F5EDE0]/60",
        !isRead && "bg-[#F5EDE0]/20",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F2EFE8]">
          {senderPhotoUrl ? (
            <img
              src={senderPhotoUrl}
              alt={senderName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-medium text-[#6B6B66]">
              {getInitials(senderName)}
            </div>
          )}
        </div>
        {!isRead && (
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#B8762A] ring-2 ring-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Top row: name + badge + timestamp */}
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              "text-sm truncate",
              !isRead ? "font-semibold text-[#1A1A1A]" : "font-medium text-[#1A1A1A]"
            )}
          >
            {senderName}
          </span>
          {senderBadge && (
            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#2D4A3A] text-white leading-none">
              {senderBadge}
            </span>
          )}
          <span className="ml-auto shrink-0 text-xs text-[#6B6B66]">
            {timestamp}
          </span>
        </div>

        {/* Signal tag */}
        <p className="text-xs font-medium text-[#B8762A] mb-1 truncate">
          <span className="mr-0.5">&#x2193;</span>
          {signal}
        </p>

        {/* Message preview */}
        <p className="text-sm text-[#6B6B66] truncate leading-snug">
          {messagePreview}
        </p>
      </div>

      {/* Chevron */}
      <div className="shrink-0 self-center ml-1">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6B6B66"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </button>
  );
}
