"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Members", href: "/admin/members/upload", icon: Users },
  { label: "Verify", href: "/admin/verify", icon: ShieldCheck },
  { label: "Surveys", href: "/admin/surveys/create", icon: ClipboardList },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export function AdminBottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--intent-text-tertiary)] bg-white safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/admin"
              ? pathname === "/admin"
              : pathname?.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-[var(--intent-amber)]"
                  : "text-[var(--intent-text-secondary)]"
              )}
            >
              <Icon className="size-5" strokeWidth={1.5} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
