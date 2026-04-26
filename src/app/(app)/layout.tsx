import { BottomTabBar } from "@/components/bottom-tab-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[var(--intent-bg)]">
      {/* Main content with bottom padding for tab bar */}
      <main className="pb-20">{children}</main>
      {/* Sticky bottom navigation */}
      <BottomTabBar />
    </div>
  );
}
