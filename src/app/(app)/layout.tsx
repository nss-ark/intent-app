"use client";

import { usePathname } from "next/navigation";
import { BottomTabBar } from "@/components/bottom-tab-bar";
import { AppHeader } from "@/components/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide navigation on conversation detail pages (/chats/[conversationId])
  const isConversationDetail =
    pathname?.startsWith("/chats/") && pathname !== "/chats";

  return (
    <div className="relative min-h-screen bg-[var(--intent-bg)]">
      {/* Sticky header with logo, nav (desktop), chat & notification icons */}
      {!isConversationDetail && <AppHeader />}
      {/* Main content with bottom padding for mobile tab bar */}
      <main className={isConversationDetail ? "" : "pb-20 md:pb-0"}>
        {children}
      </main>
      {/* Mobile bottom tab bar — hidden on desktop and conversation detail */}
      {!isConversationDetail && <BottomTabBar />}
    </div>
  );
}
