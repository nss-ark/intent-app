"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Info,
  Paperclip,
  Send,
} from "lucide-react";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { sampleConversations } from "@/data/sample-conversations";
import { sampleMessages } from "@/data/sample-conversations";

/**
 * Screen 17: Conversation Detail
 *
 * Shows the full message thread between the current user and a participant.
 * The bottom tab bar is conditionally hidden by the (app) layout based on
 * the pathname matching /chats/[conversationId].
 */
export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

  // Find conversation metadata
  const conversation = sampleConversations.find(
    (c) => c.id === conversationId
  );
  const participantName = conversation?.participantName ?? "Rajesh Iyer";
  const gradientFrom = conversation?.participantGradientFrom ?? "#6B6B66";
  const gradientTo = conversation?.participantGradientTo ?? "#9B9B94";
  const isOnline = conversation?.isOnline ?? true;

  // Group messages by date for rendering date separators
  const messagesByDate: { date: string; messages: typeof sampleMessages }[] =
    [];
  for (const msg of sampleMessages) {
    const last = messagesByDate[messagesByDate.length - 1];
    if (last && last.date === msg.displayDate) {
      last.messages.push(msg);
    } else {
      messagesByDate.push({ date: msg.displayDate, messages: [msg] });
    }
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[640px] flex-col bg-[var(--intent-bg)]">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--intent-text-tertiary)] bg-white/95 px-3 py-2.5 backdrop-blur-md">
        <Link
          href="/chats"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-amber-subtle)]"
          aria-label="Back to chats"
        >
          <ArrowLeft size={20} strokeWidth={1.5} className="text-[var(--intent-text-primary)]" />
        </Link>

        <div className="flex flex-1 items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <AvatarPlaceholder
              name={participantName}
              gradientFrom={gradientFrom}
              gradientTo={gradientTo}
              size={36}
            />
            {isOnline && (
              <span
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
                aria-label="Online"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight text-[var(--intent-text-primary)]">
              {participantName}
            </p>
            {isOnline && (
              <p className="text-[12px] font-medium leading-tight text-emerald-600">
                Online
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-amber-subtle)]"
            aria-label="Schedule meeting"
          >
            <Calendar size={18} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-amber-subtle)]"
            aria-label="Conversation info"
          >
            <Info size={18} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
          </button>
        </div>
      </header>

      {/* ── Mentorship banner ───────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-1.5 border-b border-[var(--intent-text-tertiary)] bg-[var(--intent-amber-subtle)]/60 px-4 py-2">
        <span className="text-[13px] text-[var(--intent-text-secondary)]">
          You&apos;re in an active mentorship
        </span>
        <span className="text-[13px] text-[var(--intent-text-secondary)]">&middot;</span>
        <button
          type="button"
          className="text-[13px] font-medium text-[var(--intent-amber)] hover:underline"
        >
          See goals
        </button>
      </div>

      {/* ── Message area ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {messagesByDate.map((group) => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="mb-4 mt-2 flex items-center justify-center">
              <span className="rounded-full bg-[var(--intent-muted)] px-3 py-1 text-[11px] font-medium text-[var(--intent-text-secondary)]">
                {group.date}
              </span>
            </div>

            {/* Messages in this date group */}
            {group.messages.map((msg) => {
              const isSent = msg.senderId === "arjun";
              return (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${isSent ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[75%]">
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                        isSent
                          ? "rounded-br-sm border border-[#E8C285] bg-[#FAF1E5] text-[var(--intent-text-primary)]"
                          : "rounded-bl-sm border border-[var(--intent-text-tertiary)] bg-white text-[var(--intent-text-primary)]"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p
                      className={`mt-1 text-[11px] text-[var(--intent-text-secondary)] ${
                        isSent ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.displayTime}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Bottom composer ──────────────────────────────────────────── */}
      <div className="sticky bottom-0 border-t border-[var(--intent-text-tertiary)] bg-white px-3 py-2.5 safe-bottom">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-amber-subtle)]"
            aria-label="Attach file"
          >
            <Paperclip
              size={20}
              strokeWidth={1.5}
              className="text-[var(--intent-text-secondary)]"
            />
          </button>
          <div className="flex min-h-[40px] flex-1 items-center rounded-full border border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)] px-4">
            <input
              type="text"
              placeholder={`Reply to ${participantName.split(" ")[0]}...`}
              className="w-full bg-transparent py-2 text-[14px] text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)] focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--intent-amber)] shadow-sm transition-colors hover:bg-[var(--intent-amber-light)]"
            aria-label="Send message"
          >
            <Send size={18} strokeWidth={2} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
