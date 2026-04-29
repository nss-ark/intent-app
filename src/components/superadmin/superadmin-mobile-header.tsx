"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Building2, Users, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
  { label: "Tenants", href: "/superadmin/tenants", icon: Building2 },
  { label: "Users", href: "/superadmin/users", icon: Users },
  { label: "Analytics", href: "/superadmin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/superadmin/settings", icon: Settings },
];

export function SuperAdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[var(--intent-text-tertiary)] bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-heading text-base font-semibold tracking-tight text-[var(--intent-text-primary)]">
            intent
          </span>
          <span className="rounded-full border border-[var(--intent-green)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--intent-green)]">
            SuperAdmin
          </span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-1.5 text-[var(--intent-text-secondary)] hover:bg-[var(--intent-green-subtle)] transition-colors"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>

      {/* Dropdown menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/10"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 top-[53px] z-40 border-b border-[var(--intent-text-tertiary)] bg-white shadow-lg">
            <nav className="space-y-0.5 p-3">
              {menuItems.map((item) => {
                const isActive =
                  item.href === "/superadmin"
                    ? pathname === "/superadmin"
                    : pathname?.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
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
          </div>
        </>
      )}
    </div>
  );
}
