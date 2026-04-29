"use client";

import {
  Building2,
  Users,
  UserCheck,
  UserPlus,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";

/* ── Types ───────────────────────────────────────────────────────────── */

interface DashboardMetrics {
  totalTenants: number;
  totalUsers: number;
  activeUsers30d: number;
  newThisWeek: number;
}

/* ── Fallback ────────────────────────────────────────────────────────── */

const fallbackMetrics: DashboardMetrics = {
  totalTenants: 0,
  totalUsers: 0,
  activeUsers30d: 0,
  newThisWeek: 0,
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function SuperAdminDashboardPage() {
  const {
    data: dashboard,
    isLoading,
    error,
  } = useQuery<DashboardMetrics>({
    queryKey: ["superadmin-dashboard"],
    queryFn: () => apiFetch("/api/superadmin/dashboard"),
  });

  const metrics = dashboard ?? fallbackMetrics;

  const metricTiles = [
    {
      label: "Total Tenants",
      value: metrics.totalTenants.toLocaleString(),
      icon: Building2,
    },
    {
      label: "Total Users",
      value: metrics.totalUsers.toLocaleString(),
      icon: Users,
    },
    {
      label: "Active Users (30d)",
      value: metrics.activeUsers30d.toLocaleString(),
      icon: UserCheck,
    },
    {
      label: "New This Week",
      value: metrics.newThisWeek.toLocaleString(),
      icon: UserPlus,
    },
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold text-[var(--intent-text-primary)] md:text-2xl">
          Platform Overview
        </h1>
        <p className="mt-1 text-sm text-[var(--intent-text-secondary)]">
          Monitor tenants, users, and platform health.
        </p>
      </div>

      {/* Error banner */}
      {error && !isLoading && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Could not load dashboard metrics. You may not have SuperAdmin access.
          </p>
        </div>
      )}

      {/* Metric tiles - 2x2 grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:gap-4">
        {isLoading ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-[var(--intent-green)]" />
          </div>
        ) : (
          metricTiles.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4 md:p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                    {metric.label}
                  </span>
                  <Icon
                    className="size-4 text-[var(--intent-text-secondary)]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="font-heading text-2xl font-semibold text-[var(--intent-text-primary)] md:text-3xl">
                  {metric.value}
                </p>
                {metric.label === "New This Week" && metrics.newThisWeek > 0 && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--intent-green)]">
                    <TrendingUp className="size-3" />
                    +{metrics.newThisWeek} this week
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
