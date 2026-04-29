"use client";

import {
  Building2,
  Users,
  UserCheck,
  UserPlus,
  BarChart3,
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

interface TenantSize {
  name: string;
  userCount: number;
}

interface AnalyticsResponse {
  metrics: DashboardMetrics;
  tenantSizes: TenantSize[];
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function AnalyticsPage() {
  // Re-use the dashboard endpoint for metrics
  const { data: dashboard, isLoading: metricsLoading } =
    useQuery<DashboardMetrics>({
      queryKey: ["superadmin-dashboard"],
      queryFn: () => apiFetch("/api/superadmin/dashboard"),
    });

  // Fetch tenant sizes for the bar chart
  const { data: analyticsData, isLoading: analyticsLoading } =
    useQuery<AnalyticsResponse>({
      queryKey: ["superadmin-analytics"],
      queryFn: () => apiFetch("/api/superadmin/analytics"),
    });

  const metrics = dashboard ?? {
    totalTenants: 0,
    totalUsers: 0,
    activeUsers30d: 0,
    newThisWeek: 0,
  };

  const tenantSizes = analyticsData?.tenantSizes ?? [];
  const maxUsers = Math.max(...tenantSizes.map((t) => t.userCount), 1);

  const isLoading = metricsLoading || analyticsLoading;

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
          Analytics
        </h1>
        <p className="mt-1 text-sm text-[var(--intent-text-secondary)]">
          Platform-wide metrics and tenant comparisons.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-[var(--intent-green)]" />
        </div>
      ) : (
        <>
          {/* Large metric cards */}
          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {metricTiles.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-5 md:p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
                      {metric.label}
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--intent-green-subtle)]">
                      <Icon
                        className="size-4 text-[var(--intent-green)]"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                  <p className="font-heading text-3xl font-semibold text-[var(--intent-text-primary)] md:text-4xl">
                    {metric.value}
                  </p>
                  {metric.label === "New This Week" && metrics.newThisWeek > 0 && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--intent-green)]">
                      <TrendingUp className="size-3" />
                      +{metrics.newThisWeek} this week
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tenant sizes bar chart */}
          <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-5 md:p-6">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3
                className="size-5 text-[var(--intent-green)]"
                strokeWidth={1.5}
              />
              <h2 className="font-heading text-base font-semibold text-[var(--intent-text-primary)]">
                Users per Tenant
              </h2>
            </div>

            {tenantSizes.length === 0 ? (
              <p className="text-sm text-[var(--intent-text-secondary)]">
                No tenant data available yet.
              </p>
            ) : (
              <div className="space-y-3">
                {tenantSizes.map((tenant) => {
                  const widthPercent = Math.max(
                    2,
                    (tenant.userCount / maxUsers) * 100
                  );
                  return (
                    <div key={tenant.name}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--intent-text-primary)]">
                          {tenant.name}
                        </span>
                        <span className="text-sm text-[var(--intent-text-secondary)]">
                          {tenant.userCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-6 w-full overflow-hidden rounded-md bg-[var(--intent-green-subtle)]">
                        <div
                          className="h-full rounded-md bg-[var(--intent-green)] transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
