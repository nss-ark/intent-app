"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { NudgeRow } from "@/components/nudge-row";
import { useReceivedNudges, useSentNudges } from "@/hooks/use-nudges";
import type { NudgeItem } from "@/hooks/use-nudges";
import { useSavedUsers, useUnsaveUser } from "@/hooks/use-saved-users";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────

function mapNudgeToRow(nudge: NudgeItem, role: "received" | "sent") {
  const person = role === "received" ? nudge.sender : nudge.receiver;
  return {
    id: nudge.id,
    senderName: person.fullName,
    senderPhotoUrl: person.photoUrl,
    senderBadge: null as string | null,
    signal:
      nudge.signals[0]?.tenantSignal?.template?.displayNameDefault ?? "",
    messagePreview: nudge.message ?? "",
    timestamp: formatDistanceToNow(new Date(nudge.sentAt), {
      addSuffix: true,
    }),
    isRead: nudge.status !== "SENT",
  };
}

// ── Tab config ────────────────────────────────────────────────────────

type TabId = "received" | "sent" | "chats" | "saved";

// ── Component ──────────────────────────────────────────────────────────

export default function InboxPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("received");

  const received = useReceivedNudges();
  const sent = useSentNudges();
  const saved = useSavedUsers();
  const unsaveUser = useUnsaveUser();

  const receivedItems = received.data?.items ?? [];
  const sentItems = sent.data?.items ?? [];
  const savedItems = saved.data?.items ?? [];

  const unreadCount = receivedItems.filter((n) => n.status === "SENT").length;
  const savedCount = saved.data?.total ?? 0;

  const tabs: { id: TabId; label: string; count: number | null }[] = [
    { id: "received", label: "Received", count: unreadCount || null },
    { id: "sent", label: "Sent", count: null },
    { id: "chats", label: "Chats", count: null },
    { id: "saved", label: "Saved", count: savedCount || null },
  ];

  const handleNudgeClick = (id: string) => {
    router.push(`/inbox/${id}`);
  };

  return (
    <div className="bg-[#FAFAF6] flex flex-col min-h-[calc(100dvh-5rem)]">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#FAFAF6]/95 backdrop-blur-sm">
        <div className="max-w-[640px] mx-auto px-4">
          {/* Title row */}
          <div className="flex items-center justify-between h-14">
            <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">
              Inbox
            </h1>
            <div className="flex items-center gap-1">
              {/* Filter icon */}
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B6B66] hover:bg-[#F2EFE8] transition-colors"
                aria-label="Filter"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </button>
              {/* Search icon */}
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B6B66] hover:bg-[#F2EFE8] transition-colors"
                aria-label="Search"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-[#E8E4DA]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "text-[#1A1A1A]"
                    : "text-[#6B6B66] hover:text-[#1A1A1A]"
                )}
              >
                {tab.label}
                {tab.count !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold leading-none",
                      activeTab === tab.id
                        ? "bg-[#B8762A] text-white"
                        : "bg-[#E8E4DA] text-[#6B6B66]"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
                {/* Active underline */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#1A1A1A]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1">
        <div className="max-w-[640px] mx-auto">
          {activeTab === "received" && (
            <div>
              {received.isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2
                    size={32}
                    className="animate-spin text-[#B8762A]"
                  />
                </div>
              )}

              {received.isError && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <p className="text-sm text-[#D94141] mb-2">
                    Failed to load nudges
                  </p>
                  <button
                    type="button"
                    onClick={() => received.refetch()}
                    className="text-sm font-medium text-[#B8762A] hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {received.isSuccess && receivedItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-16 h-16 rounded-full bg-[#F2EFE8] flex items-center justify-center mb-4">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B6B66"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[#1A1A1A] mb-1">
                    No nudges yet
                  </p>
                  <p className="text-xs text-[#6B6B66] text-center max-w-[240px]">
                    When someone sends you a nudge, it&apos;ll appear here.
                  </p>
                </div>
              )}

              {received.isSuccess && receivedItems.length > 0 && (
                <div className="divide-y divide-[#E8E4DA]/60">
                  {receivedItems.map((nudge) => {
                    const row = mapNudgeToRow(nudge, "received");
                    return (
                      <NudgeRow
                        key={row.id}
                        {...row}
                        onClick={handleNudgeClick}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div>
              {sent.isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2
                    size={32}
                    className="animate-spin text-[#B8762A]"
                  />
                </div>
              )}

              {sent.isError && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <p className="text-sm text-[#D94141] mb-2">
                    Failed to load sent nudges
                  </p>
                  <button
                    type="button"
                    onClick={() => sent.refetch()}
                    className="text-sm font-medium text-[#B8762A] hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {sent.isSuccess && sentItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-16 h-16 rounded-full bg-[#F2EFE8] flex items-center justify-center mb-4">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B6B66"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[#1A1A1A] mb-1">
                    No sent nudges yet
                  </p>
                  <p className="text-xs text-[#6B6B66] text-center max-w-[240px]">
                    When you send nudges to people, they&apos;ll appear here.
                  </p>
                </div>
              )}

              {sent.isSuccess && sentItems.length > 0 && (
                <div className="divide-y divide-[#E8E4DA]/60">
                  {sentItems.map((nudge) => {
                    const row = mapNudgeToRow(nudge, "sent");
                    return (
                      <NudgeRow
                        key={row.id}
                        {...row}
                        onClick={handleNudgeClick}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "chats" && (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <div className="w-16 h-16 rounded-full bg-[#F2EFE8] flex items-center justify-center mb-4">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B6B66"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#1A1A1A] mb-1">
                No chats yet
              </p>
              <p className="text-xs text-[#6B6B66] text-center max-w-[240px]">
                Accepted nudges become conversations. They&apos;ll show up here.
              </p>
            </div>
          )}

          {activeTab === "saved" && (
            <div>
              {saved.isLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2
                    size={32}
                    className="animate-spin text-[#B8762A]"
                  />
                </div>
              )}

              {saved.isError && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <p className="text-sm text-[#D94141] mb-2">
                    Failed to load saved profiles
                  </p>
                  <button
                    type="button"
                    onClick={() => saved.refetch()}
                    className="text-sm font-medium text-[#B8762A] hover:underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {saved.isSuccess && savedItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="w-16 h-16 rounded-full bg-[#F2EFE8] flex items-center justify-center mb-4">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6B6B66"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[#1A1A1A] mb-1">
                    No saved profiles
                  </p>
                  <p className="text-xs text-[#6B6B66] text-center max-w-[240px]">
                    Bookmark profiles you want to revisit later.
                  </p>
                </div>
              )}

              {saved.isSuccess && savedItems.length > 0 && (
                <div className="divide-y divide-[#E8E4DA]/60">
                  {savedItems.map((item) => {
                    const user = item.savedUser;
                    const exp = user.experience[0];
                    const role = exp
                      ? exp.company?.name
                        ? `${exp.title} at ${exp.company.name}`
                        : exp.freeTextCompanyName
                          ? `${exp.title} at ${exp.freeTextCompanyName}`
                          : exp.title
                      : null;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <Link
                          href={`/profile/${user.id}`}
                          className="flex items-center gap-3 flex-1 min-w-0"
                        >
                          <div className="w-11 h-11 rounded-full bg-[#F2EFE8] flex items-center justify-center shrink-0 overflow-hidden">
                            {user.photoUrl ? (
                              <img
                                src={user.photoUrl}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-[#6B6B66]">
                                {getInitials(user.fullName)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                              {user.fullName}
                            </p>
                            {role && (
                              <p className="text-xs text-[#6B6B66] truncate">
                                {role}
                              </p>
                            )}
                            {user.profile?.currentCity && (
                              <p className="text-xs text-[#6B6B66]">
                                {user.profile.currentCity}
                              </p>
                            )}
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => unsaveUser.mutate(user.id)}
                          className="shrink-0 text-[#6B6B66] hover:text-[#D94141] transition-colors p-1.5"
                          aria-label={`Remove ${user.fullName} from saved`}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="#B8762A"
                            stroke="#B8762A"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
