"use client";

import { usePathname } from "next/navigation";
import { BottomTabBar } from "@/components/bottom-tab-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide the bottom tab bar on conversation detail pages (/chats/[conversationId])
  const isConversationDetail =
    pathname?.startsWith("/chats/") && pathname !== "/chats";

  return (
    <div className="relative min-h-screen bg-[var(--intent-bg)]">
      {/* Main content with bottom padding for tab bar (skip when tab bar is hidden) */}
      <main className={isConversationDetail ? "" : "pb-20"}>{children}</main>
      {/* Sticky bottom navigation — hidden on conversation detail */}
      {!isConversationDetail && <BottomTabBar />}
    </div>
  );
}
