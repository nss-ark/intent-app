"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Info,
  Loader2,
  Paperclip,
  Send,
} from "lucide-react";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { useConversation, useSendMessage } from "@/hooks/use-conversations";
import { format, isToday, isYesterday } from "date-fns";

/**
 * Screen 17: Conversation Detail
 *
 * Shows the full message thread between the current user and a participant.
 * The bottom tab bar is conditionally hidden by the (app) layout based on
 * the pathname matching /chats/[conversationId].
 */

/** Format a date into a human-friendly group label */
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
}

/** Format a time for display next to a message bubble */
function formatTime(dateStr: string): string {
  return format(new Date(dateStr), "h:mm a");
}

interface MessageGroup {
  date: string;
  messages: { id: string; senderUserId: string; body: string; sentAt: string }[];
}

export default function ConversationDetailPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = params.conversationId as string;

  const { data: conversation, isLoading } = useConversation(conversationId);
  const sendMessage = useSendMessage();

  const [inputValue, setInputValue] = useState("");

  // Derive the current user ID: whichever of userAId / userBId is NOT the otherUser
  const currentUserId =
    conversation && conversation.otherUser
      ? conversation.userAId === conversation.otherUser.id
        ? conversation.userBId
        : conversation.userAId
      : null;

  const participantName = conversation?.otherUser?.fullName ?? "...";

  // Group messages by date for rendering date separators
  const messagesByDate: MessageGroup[] = [];
  if (conversation?.messages?.items) {
    for (const msg of conversation.messages.items) {
      const dateLabel = formatDateLabel(msg.sentAt);
      const last = messagesByDate[messagesByDate.length - 1];
      if (last && last.date === dateLabel) {
        last.messages.push(msg);
      } else {
        messagesByDate.push({ date: dateLabel, messages: [msg] });
      }
    }
  }

  function handleSend() {
    const body = inputValue.trim();
    if (!body || !conversationId) return;
    setInputValue("");
    sendMessage.mutate({ conversationId, body });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto flex h-[100dvh] w-full max-w-[640px] items-center justify-center bg-[var(--intent-bg)]">
        <Loader2
          size={28}
          className="animate-spin text-[var(--intent-navy)]"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-[640px] flex-col bg-[var(--intent-bg)]">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--intent-text-tertiary)] bg-white/95 px-3 py-2.5 backdrop-blur-md">
        <Link
          href="/chats"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-navy-subtle)]"
          aria-label="Back to chats"
        >
          <ArrowLeft size={20} strokeWidth={1.5} className="text-[var(--intent-text-primary)]" />
        </Link>

        <div className="flex flex-1 items-center gap-2.5">
          <div className="relative flex-shrink-0">
            <AvatarPlaceholder
              name={participantName}
              size={36}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight text-[var(--intent-text-primary)]">
              {participantName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-navy-subtle)]"
            aria-label="Schedule meeting"
          >
            <Calendar size={18} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-navy-subtle)]"
            aria-label="Conversation info"
          >
            <Info size={18} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
          </button>
        </div>
      </header>

      {/* ── Context banner ────────────────────────────────────────── */}
      {conversation?.matchId ? (
        <div className="flex items-center justify-center gap-1.5 border-b border-[var(--intent-text-tertiary)] bg-[var(--intent-navy-subtle)]/60 px-4 py-2">
          <span className="text-[13px] text-[var(--intent-text-secondary)]">
            Connected via match
          </span>
        </div>
      ) : conversation?.originatedFromNudgeId ? (
        <div className="flex items-center justify-center gap-1.5 border-b border-[var(--intent-text-tertiary)] bg-[var(--intent-navy-subtle)]/60 px-4 py-2">
          <span className="text-[13px] text-[var(--intent-text-secondary)]">
            Connected via nudge
          </span>
        </div>
      ) : null}

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
              const isSent = msg.senderUserId === currentUserId;
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
                      {msg.body}
                    </div>
                    <p
                      className={`mt-1 text-[11px] text-[var(--intent-text-secondary)] ${
                        isSent ? "text-right" : "text-left"
                      }`}
                    >
                      {formatTime(msg.sentAt)}
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
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-navy-subtle)]"
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Reply to ${participantName.split(" ")[0]}...`}
              className="w-full bg-transparent py-2 text-[14px] text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={sendMessage.isPending || !inputValue.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--intent-navy)] shadow-sm transition-colors hover:bg-[var(--intent-navy-light)] disabled:opacity-50"
            aria-label="Send message"
          >
            {sendMessage.isPending ? (
              <Loader2 size={18} strokeWidth={2} className="animate-spin text-white" />
            ) : (
              <Send size={18} strokeWidth={2} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
