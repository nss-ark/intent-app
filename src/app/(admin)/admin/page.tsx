"use client";

import Link from "next/link";
import {
  Bell,
  Users,
  Send,
  Coffee,
  ShieldAlert,
  ChevronRight,
  Plus,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

/* ── Types ───────────────────────────────────────────────────────────── */

interface DashboardMetrics {
  activeMembers: number;
  activeMembersChange: number;
  nudgesSent: number;
  nudgesSentChange: number;
  meetupsHeld: number;
  meetupsHeldChange: number;
  pendingVerifications: number;
}

interface Verification {
  id: string;
  userName: string;
  userInitials: string;
  badgeName: string;
  badgeType: string;
}

interface RecentActivityItem {
  id: string;
  text: string;
  time: string;
}

/* ── Fallback static data (used while API loads or on error) ─────── */

const fallbackMetrics: DashboardMetrics = {
  activeMembers: 0,
  activeMembersChange: 0,
  nudgesSent: 0,
  nudgesSentChange: 0,
  meetupsHeld: 0,
  meetupsHeldChange: 0,
  pendingVerifications: 0,
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useQuery<DashboardMetrics>({
    queryKey: ["admin-dashboard"],
    queryFn: () => apiFetch("/api/admin/dashboard"),
  });

  const {
    data: verifications,
    isLoading: verificationsLoading,
  } = useQuery<Verification[]>({
    queryKey: ["admin-verifications"],
    queryFn: () => apiFetch("/api/admin/verifications"),
  });

  const {
    data: activityData,
    isLoading: activityLoading,
  } = useQuery<RecentActivityItem[]>({
    queryKey: ["admin-activity"],
    queryFn: () => apiFetch("/api/admin/activity"),
  });

  const metrics = dashboard ?? fallbackMetrics;
  const pendingVerifications = verifications ?? [];
  const recentActivity = activityData ?? [];

  const metricTiles = [
    {
      label: "Active Members",
      value: metrics.activeMembers.toLocaleString(),
      change: metrics.activeMembersChange > 0
        ? `+${metrics.activeMembersChange} this week`
        : "No change",
      changeColor: metrics.activeMembersChange > 0
        ? "text-[var(--intent-green)]"
        : "text-[var(--intent-text-secondary)]",
      icon: Users,
    },
    {
      label: "Nudges Sent",
      value: metrics.nudgesSent.toLocaleString(),
      change: metrics.nudgesSentChange > 0
        ? `+${metrics.nudgesSentChange} this week`
        : "No change",
      changeColor: "text-[var(--intent-text-secondary)]",
      icon: Send,
    },
    {
      label: "Meetups Held",
      value: metrics.meetupsHeld.toLocaleString(),
      change: metrics.meetupsHeldChange > 0
        ? `+${metrics.meetupsHeldChange} this week`
        : "No change",
      changeColor: "text-[var(--intent-text-secondary)]",
      icon: Coffee,
    },
    {
      label: "Pending Verifications",
      value: String(metrics.pendingVerifications),
      change: metrics.pendingVerifications > 0 ? "Review needed" : "All clear",
      changeColor: metrics.pendingVerifications > 0
        ? "text-[var(--intent-navy)]"
        : "text-[var(--intent-green)]",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-semibold tracking-tight text-[var(--intent-text-primary)]">
            intent
          </span>
          <span className="text-lg text-[var(--intent-text-secondary)]">&middot;</span>
          <span className="font-heading text-lg font-semibold tracking-tight text-[var(--intent-navy)]">
            admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative rounded-lg p-2 text-[var(--intent-text-secondary)] hover:bg-[var(--intent-navy-subtle)] transition-colors">
            <Bell className="size-5" strokeWidth={1.5} />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--intent-navy)]" />
          </button>
          <div className="flex size-8 items-center justify-center rounded-full bg-[var(--intent-green)] text-xs font-semibold text-white">
            MK
          </div>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold text-[var(--intent-text-primary)] md:text-2xl">
          Good morning, Meera.
        </h1>
        <p className="mt-1 text-sm text-[var(--intent-text-secondary)]">
          Here&apos;s what&apos;s happening at ISB today.
        </p>
      </div>

      {/* Error banner */}
      {dashboardError && !dashboardLoading && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            Could not load dashboard metrics. You may not have admin access.
          </p>
        </div>
      )}

      {/* Metric tiles - 2x2 grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:gap-4">
        {dashboardLoading ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-[var(--intent-navy)]" />
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
                <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${metric.changeColor}`}>
                  {metric.change.startsWith("+") && (
                    <TrendingUp className="size-3" />
                  )}
                  {metric.change}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Pending Verifications */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-[var(--intent-text-primary)]">
            Pending verifications
          </h2>
          <Link
            href="/admin/verify"
            className="text-xs font-medium text-[var(--intent-navy)] hover:underline"
          >
            View all
          </Link>
        </div>
        {verificationsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-[var(--intent-navy)]" />
          </div>
        ) : pendingVerifications.length === 0 ? (
          <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-6 text-center">
            <p className="text-sm text-[var(--intent-text-secondary)]">
              No pending verifications
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingVerifications.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--intent-navy-subtle)] text-xs font-semibold text-[var(--intent-navy)]">
                  {v.userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--intent-text-primary)] truncate">
                    {v.userName}
                  </p>
                  <p className="text-xs text-[var(--intent-text-secondary)]">
                    {v.badgeName} &middot; {v.badgeType}
                  </p>
                </div>
                <Link href={`/admin/verify/${v.id}`}>
                  <Button
                    variant="outline"
                    className="h-8 rounded-lg border-[var(--intent-navy)] text-xs font-medium text-[var(--intent-navy)] hover:bg-[var(--intent-navy-subtle)]"
                  >
                    Review
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="mb-3 font-heading text-base font-semibold text-[var(--intent-text-primary)]">
          Recent activity
        </h2>
        {activityLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-[var(--intent-navy)]" />
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-6 text-center">
            <p className="text-sm text-[var(--intent-text-secondary)]">
              No recent activity
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white">
            {recentActivity.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-start justify-between px-4 py-3 ${
                  i < recentActivity.length - 1
                    ? "border-b border-[var(--intent-text-tertiary)]"
                    : ""
                }`}
              >
                <p className="text-sm text-[var(--intent-text-primary)]">
                  {item.text}
                </p>
                <span className="ml-3 shrink-0 text-xs text-[var(--intent-text-secondary)]">
                  {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 font-heading text-base font-semibold text-[var(--intent-text-primary)]">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/members/upload">
            <Button
              variant="outline"
              className="h-9 gap-1.5 rounded-lg border-[var(--intent-text-tertiary)] text-sm font-medium text-[var(--intent-text-primary)]"
            >
              <Plus className="size-4" />
              Add members
            </Button>
          </Link>
          <Link href="/admin/surveys/create">
            <Button
              variant="outline"
              className="h-9 gap-1.5 rounded-lg border-[var(--intent-text-tertiary)] text-sm font-medium text-[var(--intent-text-primary)]"
            >
              <Plus className="size-4" />
              New survey
            </Button>
          </Link>
          <Link href="/admin/events">
            <Button
              variant="outline"
              className="h-9 gap-1.5 rounded-lg border-[var(--intent-text-tertiary)] text-sm font-medium text-[var(--intent-text-primary)]"
            >
              <Plus className="size-4" />
              New event
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
