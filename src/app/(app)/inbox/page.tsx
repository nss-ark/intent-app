"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NudgeRow } from "@/components/nudge-row";
import { cn } from "@/lib/utils";

// ── Sample data ────────────────────────────────────────────────────────

const tabs = [
  { id: "received", label: "Received", count: 3 },
  { id: "sent", label: "Sent", count: null },
  { id: "chats", label: "Chats", count: null },
  { id: "saved", label: "Saved", count: null },
] as const;

type TabId = (typeof tabs)[number]["id"];

const recentNudges = [
  {
    id: "nudge-001",
    senderName: "Vikram Subramanian",
    senderPhotoUrl: null,
    senderBadge: "Founder",
    signal: "Looking for a co-founder",
    messagePreview:
      "Arjun, your background at Flipkart and your interest in fintech caught my eye. I'm building a...",
    timestamp: "2h ago",
    isRead: false,
  },
  {
    id: "nudge-002",
    senderName: "Priya Reddy",
    senderPhotoUrl: null,
    senderBadge: null,
    signal: "Open to coffee chat",
    messagePreview:
      "Hi Arjun! I noticed we're both in Hyderabad. Would love to chat about your...",
    timestamp: "1d ago",
    isRead: false,
  },
  {
    id: "nudge-003",
    senderName: "Rohan Kapoor",
    senderPhotoUrl: null,
    senderBadge: null,
    signal: "Curious about Tiger Global",
    messagePreview:
      "Hey Arjun, saw your interest in VC. Happy to share my experience...",
    timestamp: "3d ago",
    isRead: true,
  },
];

const earlierNudges = [
  {
    id: "nudge-004",
    senderName: "Meera Iyer",
    senderPhotoUrl: null,
    senderBadge: null,
    signal: "Looking for a mentor in this domain",
    messagePreview:
      "Hi! I'm transitioning into product management and your journey from engineering to PM...",
    timestamp: "5d ago",
    isRead: true,
  },
  {
    id: "nudge-005",
    senderName: "Siddharth Nair",
    senderPhotoUrl: null,
    senderBadge: "Alumni",
    signal: "Open to giving referrals",
    messagePreview:
      "Arjun, I saw you're interested in fintech roles. We have a couple of openings at...",
    timestamp: "6d ago",
    isRead: true,
  },
];

// ── Component ──────────────────────────────────────────────────────────

export default function InboxPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("received");

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
              {/* Recent nudges */}
              <div className="divide-y divide-[#E8E4DA]/60">
                {recentNudges.map((nudge) => (
                  <NudgeRow
                    key={nudge.id}
                    {...nudge}
                    onClick={handleNudgeClick}
                  />
                ))}
              </div>

              {/* Section header */}
              <div className="px-4 py-3 bg-[#F2EFE8]/50">
                <p className="text-xs font-semibold text-[#6B6B66] uppercase tracking-wider">
                  Earlier this week
                </p>
              </div>

              {/* Earlier nudges */}
              <div className="divide-y divide-[#E8E4DA]/60">
                {earlierNudges.map((nudge) => (
                  <NudgeRow
                    key={nudge.id}
                    {...nudge}
                    onClick={handleNudgeClick}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "sent" && (
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
        </div>
      </main>
    </div>
  );
}
