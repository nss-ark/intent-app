"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Bell, Handshake, MessageSquareText, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";

const desktopTabs = [
  { href: "/matching", label: "Matching", icon: Handshake },
  { href: "/feed", label: "Feed", icon: MessageSquareText },
  { href: "/activities", label: "Activities", icon: Calendar },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  const { data: notifData } = useQuery<{ data?: { total?: number } }>({
    queryKey: ["unread-notifications-count"],
    queryFn: () => apiFetch("/api/notifications?unreadOnly=true&pageSize=1"),
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.data?.total ?? 0;

  return (
    <header
      className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
      style={{ borderColor: "var(--intent-text-tertiary)" }}
    >
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/feed" className="flex items-center gap-1.5">
          <span
            className="text-lg font-heading font-semibold tracking-tight"
            style={{ color: "var(--intent-text-primary)" }}
          >
            intent
          </span>
        </Link>

        {/* Center: Desktop nav tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {desktopTabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname?.startsWith(tab.href + "/");
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--intent-amber-subtle)] text-[var(--intent-amber)]"
                    : "text-[var(--intent-text-secondary)] hover:bg-[var(--intent-amber-subtle)]/40 hover:text-[var(--intent-text-primary)]"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Chat, Notifications, Profile (desktop) */}
        <div className="flex items-center gap-2">
          <Link
            href="/chats"
            className={cn(
              "relative flex items-center justify-center rounded-lg p-2 transition-colors",
              pathname?.startsWith("/chats")
                ? "text-[var(--intent-amber)]"
                : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
            )}
          >
            <MessageCircle size={20} strokeWidth={1.5} />
          </Link>

          <Link
            href="/notifications"
            className={cn(
              "relative flex items-center justify-center rounded-lg p-2 transition-colors",
              pathname?.startsWith("/notifications")
                ? "text-[var(--intent-amber)]"
                : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
            )}
          >
            <Bell size={20} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--intent-amber)] px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Desktop-only profile link */}
          <Link
            href="/my-profile"
            className={cn(
              "hidden md:flex items-center justify-center rounded-lg p-2 transition-colors",
              pathname?.startsWith("/my-profile")
                ? "text-[var(--intent-amber)]"
                : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
            )}
          >
            <User size={20} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}
