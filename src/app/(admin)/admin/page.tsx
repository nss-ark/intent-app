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
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Static data ──────────────────────────────────────────────────────── */

const metrics = [
  {
    label: "Active Members",
    value: "1,247",
    change: "+24 this week",
    changeColor: "text-[var(--intent-green)]",
    icon: Users,
  },
  {
    label: "Nudges Sent",
    value: "3,891",
    change: "+412 this week",
    changeColor: "text-[var(--intent-text-secondary)]",
    icon: Send,
  },
  {
    label: "Meetups Held",
    value: "23",
    change: "+5 this week",
    changeColor: "text-[var(--intent-text-secondary)]",
    icon: Coffee,
  },
  {
    label: "Pending Verifications",
    value: "12",
    change: "Review needed",
    changeColor: "text-[var(--intent-amber)]",
    icon: ShieldAlert,
  },
];

const pendingVerifications = [
  {
    id: "1",
    name: "Karthik Subramanyam",
    photo: "KS",
    badge: "Founder Badge",
    type: "Pre-revenue",
  },
  {
    id: "2",
    name: "Sneha Ramaswamy",
    photo: "SR",
    badge: "Company Verification",
    type: "Sequoia",
  },
  {
    id: "3",
    name: "Aditi Bhatnagar",
    photo: "AB",
    badge: "Domain Expert",
    type: "Badge",
  },
];

const recentActivity = [
  { text: "Riya Mehrotra completed her profile", time: "2 min ago" },
  { text: "Survey 'Career Goals 2026' received 84 responses", time: "15 min ago" },
  { text: "Pranav Bhattacharya requested Founder Badge", time: "1h ago" },
  { text: "Batch import: 48 new members added from CSV", time: "3h ago" },
  { text: "Event 'ISB Connect Delhi' published", time: "5h ago" },
];

/* ── Component ────────────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-semibold tracking-tight text-[var(--intent-text-primary)]">
            intent
          </span>
          <span className="text-lg text-[var(--intent-text-secondary)]">&middot;</span>
          <span className="font-heading text-lg font-semibold tracking-tight text-[var(--intent-amber)]">
            admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative rounded-lg p-2 text-[var(--intent-text-secondary)] hover:bg-[var(--intent-amber-subtle)] transition-colors">
            <Bell className="size-5" strokeWidth={1.5} />
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--intent-amber)]" />
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

      {/* Metric tiles - 2x2 grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:gap-4">
        {metrics.map((metric) => {
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
        })}
      </div>

      {/* Pending Verifications */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-[var(--intent-text-primary)]">
            Pending verifications
          </h2>
          <Link
            href="/admin/verify"
            className="text-xs font-medium text-[var(--intent-amber)] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {pendingVerifications.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--intent-amber-subtle)] text-xs font-semibold text-[var(--intent-amber)]">
                {v.photo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--intent-text-primary)] truncate">
                  {v.name}
                </p>
                <p className="text-xs text-[var(--intent-text-secondary)]">
                  {v.badge} &middot; {v.type}
                </p>
              </div>
              <Link href={`/admin/verify/${v.id}`}>
                <Button
                  variant="outline"
                  className="h-8 rounded-lg border-[var(--intent-amber)] text-xs font-medium text-[var(--intent-amber)] hover:bg-[var(--intent-amber-subtle)]"
                >
                  Review
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="mb-3 font-heading text-base font-semibold text-[var(--intent-text-primary)]">
          Recent activity
        </h2>
        <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white">
          {recentActivity.map((item, i) => (
            <div
              key={i}
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
                {item.time}
              </span>
            </div>
          ))}
        </div>
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
