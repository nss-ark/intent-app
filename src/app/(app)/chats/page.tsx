"use client";

import Link from "next/link";
import { Search, PenSquare, Loader2 } from "lucide-react";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { useConversations } from "@/hooks/use-conversations";
import { formatDistanceToNow } from "date-fns";

export default function ChatsPage() {
  const { data, isLoading } = useConversations();
  const conversations = data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[640px]">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-[var(--intent-bg)]/95 px-4 pb-2 pt-4 backdrop-blur-md">
        <h1 className="font-heading text-2xl font-semibold text-[var(--intent-text-primary)]">
          Chats
        </h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-amber-subtle)]"
            aria-label="Search conversations"
          >
            <Search
              size={20}
              strokeWidth={1.5}
              className="text-[var(--intent-text-secondary)]"
            />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-amber-subtle)]"
            aria-label="New conversation"
          >
            <PenSquare
              size={20}
              strokeWidth={1.5}
              className="text-[var(--intent-text-secondary)]"
            />
          </button>
        </div>
      </header>

      {/* ── Loading state ──────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2
            size={28}
            className="animate-spin text-[var(--intent-amber)]"
          />
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────── */}
      {!isLoading && conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[15px] text-[var(--intent-text-secondary)]">
            No conversations yet
          </p>
        </div>
      )}

      {/* ── Conversation list ───────────────────────────────────────── */}
      <div className="flex flex-col">
        {conversations.map((conv, idx) => {
          const timestamp = conv.lastMessage?.sentAt
            ? formatDistanceToNow(new Date(conv.lastMessage.sentAt), {
                addSuffix: false,
              })
            : "";

          return (
            <Link
              key={conv.id}
              href={`/chats/${conv.id}`}
              className="group block"
            >
              <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--intent-amber-subtle)]/40">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <AvatarPlaceholder
                    name={conv.otherUser.fullName}
                    size={56}
                  />
                </div>

                {/* Middle: name + message preview */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`truncate text-[15px] font-semibold text-[var(--intent-text-primary)] ${
                        conv.unreadCount > 0 ? "font-bold" : ""
                      }`}
                    >
                      {conv.otherUser.fullName}
                    </span>
                  </div>
                  <p
                    className={`mt-0.5 truncate text-[13px] leading-snug ${
                      conv.unreadCount > 0
                        ? "font-medium text-[var(--intent-text-primary)]"
                        : "text-[var(--intent-text-secondary)]"
                    }`}
                  >
                    {conv.lastMessage?.body ?? "No messages yet"}
                  </p>
                </div>

                {/* Right: timestamp + unread badge */}
                <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                  <span
                    className={`text-[12px] ${
                      conv.unreadCount > 0
                        ? "font-medium text-[var(--intent-amber)]"
                        : "text-[var(--intent-text-secondary)]"
                    }`}
                  >
                    {timestamp}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--intent-amber)] px-1.5 text-[11px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Divider (not after last item) */}
              {idx < conversations.length - 1 && (
                <div className="mx-4 border-b border-[var(--intent-text-tertiary)]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
