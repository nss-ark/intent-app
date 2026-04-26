"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Static data ──────────────────────────────────────────────────────── */

type SLAStatus = "green" | "amber" | "red";

interface VerificationRow {
  id: string;
  name: string;
  initials: string;
  requestType: string;
  submitted: string;
  sla: SLAStatus;
  slaLabel: string;
}

const verifications: VerificationRow[] = [
  {
    id: "v1",
    name: "Karthik Subramanyam",
    initials: "KS",
    requestType: "FOUNDER BADGE PRE-REVENUE",
    submitted: "4h ago",
    sla: "green",
    slaLabel: "Within SLA",
  },
  {
    id: "v2",
    name: "Sneha Ramaswamy",
    initials: "SR",
    requestType: "COMPANY VERIFICATION SEQUOIA",
    submitted: "6h ago",
    sla: "green",
    slaLabel: "Within SLA",
  },
  {
    id: "v3",
    name: "Aditi Bhatnagar",
    initials: "AB",
    requestType: "DOMAIN EXPERT BADGE",
    submitted: "1d ago",
    sla: "amber",
    slaLabel: "8h left",
  },
  {
    id: "v4",
    name: "Pranav Bhattacharya",
    initials: "PB",
    requestType: "FOUNDER BADGE FUNDED",
    submitted: "2d ago",
    sla: "amber",
    slaLabel: "8h left",
  },
  {
    id: "v5",
    name: "Riya Mehrotra",
    initials: "RM",
    requestType: "COMPANY VERIFICATION MCKINSEY",
    submitted: "3d ago",
    sla: "red",
    slaLabel: "SLA breached",
  },
  {
    id: "v6",
    name: "Tarun Goyal",
    initials: "TG",
    requestType: "MENTOR BADGE",
    submitted: "4d ago",
    sla: "red",
    slaLabel: "SLA breached",
  },
];

const tabs = [
  { id: "pending", label: "Pending", count: 12 },
  { id: "info-requested", label: "Info requested", count: 3 },
  { id: "decided", label: "Decided", count: 89 },
];

const slaColors: Record<SLAStatus, string> = {
  green: "bg-[var(--intent-green)]",
  amber: "bg-[var(--intent-amber)]",
  red: "bg-[var(--destructive)]",
};

const slaTextColors: Record<SLAStatus, string> = {
  green: "text-[var(--intent-green)]",
  amber: "text-[var(--intent-amber)]",
  red: "text-[var(--destructive)]",
};

/* ── Component ────────────────────────────────────────────────────────── */

export default function VerificationQueuePage() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="mx-auto max-w-[700px] px-4 py-6 md:px-8 md:py-8">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)] transition-colors md:hidden"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="font-heading text-xl font-semibold text-[var(--intent-text-primary)]">
          Verifications
        </h1>
        <button className="rounded-lg p-2 text-[var(--intent-text-secondary)] hover:bg-[var(--intent-amber-subtle)] transition-colors">
          <SlidersHorizontal className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-[var(--intent-bg)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "bg-white text-[var(--intent-text-primary)] shadow-sm"
                : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                activeTab === tab.id
                  ? "bg-[var(--intent-amber)] text-white"
                  : "bg-[var(--intent-text-tertiary)] text-[var(--intent-text-secondary)]"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Verification rows */}
      <div className="space-y-2">
        {verifications.map((v) => (
          <Link
            key={v.id}
            href={`/admin/verify/${v.id}`}
            className="flex items-center gap-3 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3 transition-colors hover:border-[var(--intent-amber)]/30"
          >
            {/* Avatar */}
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--intent-amber-subtle)] text-sm font-semibold text-[var(--intent-amber)]">
              {v.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--intent-text-primary)] truncate">
                {v.name}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--intent-amber)]">
                {v.requestType}
              </p>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="text-xs text-[var(--intent-text-secondary)]">
                  {v.submitted}
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className={cn(
                      "inline-block size-2 rounded-full",
                      slaColors[v.sla]
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      slaTextColors[v.sla]
                    )}
                  >
                    {v.slaLabel}
                  </span>
                </span>
              </div>
            </div>

            {/* Chevron */}
            <ChevronRight
              className="size-4 shrink-0 text-[var(--intent-text-secondary)]"
              strokeWidth={1.5}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
