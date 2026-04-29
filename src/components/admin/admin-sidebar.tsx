"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Members", href: "/admin/members/upload", icon: Users },
  { label: "Verify", href: "/admin/verify", icon: ShieldCheck },
  { label: "Surveys", href: "/admin/surveys/create", icon: ClipboardList },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-[240px] flex-col border-r border-[var(--intent-text-tertiary)] bg-white",
        className
      )}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="font-heading text-lg font-semibold tracking-tight text-[var(--intent-text-primary)]">
          intent
        </span>
        <span className="rounded-full border border-[var(--intent-navy)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--intent-navy)]">
          Admin
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--intent-navy-subtle)] text-[var(--intent-navy)]"
                  : "text-[var(--intent-text-secondary)] hover:bg-[var(--intent-navy-subtle)]/50 hover:text-[var(--intent-text-primary)]"
              )}
            >
              <Icon className="size-[18px]" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--intent-text-tertiary)] px-5 py-4">
        <p className="text-xs text-[var(--intent-text-secondary)]">
          Intent Admin v1.0.0
        </p>
      </div>
    </aside>
  );
}
