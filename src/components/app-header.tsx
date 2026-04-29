"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { MessageCircle, Bell, Handshake, MessageSquareText, Calendar, User, Settings, LogOut } from "lucide-react";
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

          {/* Desktop-only profile dropdown */}
          <ProfileDropdown pathname={pathname} />
        </div>
      </div>
    </header>
  );
}

function ProfileDropdown({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = pathname?.startsWith("/my-profile") || pathname?.startsWith("/settings");

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center justify-center rounded-lg p-2 transition-colors",
          isActive
            ? "text-[var(--intent-amber)]"
            : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
        )}
      >
        <User size={20} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl border border-[#E8E4DA] bg-white py-1 shadow-lg">
          <Link
            href="/my-profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--intent-text-primary)] hover:bg-[var(--intent-amber-subtle)]/60 transition-colors"
          >
            <User size={16} strokeWidth={1.5} />
            My Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--intent-text-primary)] hover:bg-[var(--intent-amber-subtle)]/60 transition-colors"
          >
            <Settings size={16} strokeWidth={1.5} />
            Settings
          </Link>
          <div className="my-1 h-px bg-[#E8E4DA]" />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
