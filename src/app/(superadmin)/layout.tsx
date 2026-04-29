"use client";

import { usePathname } from "next/navigation";
import { SuperAdminSidebar } from "@/components/superadmin/superadmin-sidebar";
import { SuperAdminBottomTabBar } from "@/components/superadmin/superadmin-bottom-tab-bar";
import { SuperAdminMobileHeader } from "@/components/superadmin/superadmin-mobile-header";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Don't show sidebar/nav on the login page
  const isLoginPage = pathname === "/superadmin/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[var(--intent-bg)]">{children}</div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* Desktop layout: sidebar + content */}
      <div className="flex h-screen">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <SuperAdminSidebar className="fixed inset-y-0 left-0 z-30" />
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col md:ml-[240px]">
          {/* Mobile header with hamburger */}
          <SuperAdminMobileHeader />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>

          {/* Mobile bottom tab bar */}
          <SuperAdminBottomTabBar />
        </div>
      </div>
    </div>
  );
}
