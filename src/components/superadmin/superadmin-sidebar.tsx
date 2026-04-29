"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { label: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
  { label: "Tenants", href: "/superadmin/tenants", icon: Building2 },
  { label: "Users", href: "/superadmin/users", icon: Users },
  { label: "Analytics", href: "/superadmin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/superadmin/settings", icon: Settings },
];

export function SuperAdminSidebar({ className }: { className?: string }) {
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
        <span className="rounded-full border border-[var(--intent-green)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--intent-green)]">
          SuperAdmin
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/superadmin"
              ? pathname === "/superadmin"
              : pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--intent-green-subtle)] text-[var(--intent-green)]"
                  : "text-[var(--intent-text-secondary)] hover:bg-[var(--intent-green-subtle)]/50 hover:text-[var(--intent-text-primary)]"
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
          Intent Platform v1.0.0
        </p>
      </div>
    </aside>
  );
}
