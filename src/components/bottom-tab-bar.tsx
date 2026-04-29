"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Handshake, MessageSquareText, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/matching", label: "Matching", icon: Handshake },
  { href: "/feed", label: "Feed", icon: MessageSquareText },
  { href: "/activities", label: "Activities", icon: Calendar },
  { href: "/my-profile", label: "Profile", icon: User },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-md safe-bottom md:hidden"
      style={{ borderColor: "var(--intent-text-tertiary)" }}
    >
      <div className="mx-auto flex h-16 max-w-[640px] items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname?.startsWith(tab.href + "/");
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[var(--intent-amber)]"
                  : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2 : 1.5}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "text-[var(--intent-amber)]"
                    : "text-[var(--intent-text-secondary)]"
                )}
              />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
