"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Link2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/* ── Static data ──────────────────────────────────────────────────────── */

const member = {
  name: "Karthik Subramanyam",
  initials: "KS",
  classYear: "PGP 2019",
  program: "Post Graduate Programme in Management",
};

const requestType = "Founder Badge \u00b7 Pre-revenue stage";

const declaration = [
  { label: "Company name", value: "NexaFlow Technologies Pvt. Ltd." },
  { label: "Registration number", value: "U72200KA2024PTC183921" },
  { label: "Country", value: "India" },
  { label: "Founded", value: "March 2024" },
  { label: "Funding stage", value: "Pre-revenue / Bootstrapped" },
  { label: "Annual revenue", value: "< INR 1L (pre-revenue)" },
  { label: "Role", value: "Co-founder & CEO" },
];

const evidence = [
  {
    id: "e1",
    label: "Certificate of Incorporation",
    type: "pdf" as const,
    icon: FileText,
  },
  {
    id: "e2",
    label: "LinkedIn Profile",
    type: "link" as const,
    icon: Link2,
  },
  {
    id: "e3",
    label: "Company Website",
    type: "link" as const,
    icon: Globe,
  },
];

const crossChecks = [
  { label: "MCA registration verified", status: "pass" as const },
  { label: "LinkedIn title matches declared role", status: "pass" as const },
  { label: "Company website is live", status: "pass" as const },
  { label: "Funding data matches public records", status: "warn" as const },
  { label: "Revenue declaration consistent", status: "warn" as const },
];

/* ── Component ────────────────────────────────────────────────────────── */

export default function VerificationDetailPage() {
  const [notes, setNotes] = useState("");

  return (
    <div className="mx-auto max-w-[700px] px-4 py-6 md:px-8 md:py-8">
      {/* Back */}
      <Link
        href="/admin/verify"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)] transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to queue
      </Link>

      {/* Member summary card */}
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-5 py-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--intent-amber-subtle)] text-base font-semibold text-[var(--intent-amber)]">
          {member.initials}
        </div>
        <div>
          <h1 className="font-heading text-lg font-semibold text-[var(--intent-text-primary)]">
            {member.name}
          </h1>
          <p className="text-sm text-[var(--intent-text-secondary)]">
            {member.classYear} &middot; {member.program}
          </p>
        </div>
      </div>

      {/* Request type */}
      <div className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
          Request type
        </h2>
        <p className="mt-1 text-base font-medium text-[var(--intent-amber)]">
          {requestType}
        </p>
      </div>

      {/* Declaration */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
          Member&apos;s declaration
        </h2>
        <div className="overflow-hidden rounded-xl border border-[var(--intent-text-tertiary)] bg-white">
          {declaration.map((field, i) => (
            <div
              key={field.label}
              className={`flex items-start justify-between px-4 py-3 ${
                i < declaration.length - 1
                  ? "border-b border-[var(--intent-text-tertiary)]"
                  : ""
              }`}
            >
              <span className="text-sm text-[var(--intent-text-secondary)]">
                {field.label}
              </span>
              <span className="ml-4 text-right text-sm font-medium text-[var(--intent-text-primary)]">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence submitted */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
          Evidence submitted
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {evidence.map((e) => {
            const Icon = e.icon;
            return (
              <button
                key={e.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4 transition-colors hover:border-[var(--intent-amber)]/40"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-[var(--intent-amber-subtle)]">
                  <Icon
                    className="size-5 text-[var(--intent-amber)]"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-center text-xs font-medium text-[var(--intent-text-primary)] leading-tight">
                  {e.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cross-checks */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
          Cross-checks
        </h2>
        <div className="space-y-2">
          {crossChecks.map((check) => (
            <div
              key={check.label}
              className="flex items-center gap-3 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3"
            >
              {check.status === "pass" ? (
                <CheckCircle2
                  className="size-4 shrink-0 text-[var(--intent-green)]"
                  strokeWidth={2}
                />
              ) : (
                <AlertTriangle
                  className="size-4 shrink-0 text-[var(--intent-amber)]"
                  strokeWidth={2}
                />
              )}
              <span className="text-sm text-[var(--intent-text-primary)]">
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin notes */}
      <div className="mb-8">
        <Label
          htmlFor="admin-notes"
          className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]"
        >
          Admin notes
        </Label>
        <Textarea
          id="admin-notes"
          placeholder="Add internal notes about this verification..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px] rounded-xl border-[var(--intent-text-tertiary)] bg-white text-sm"
        />
      </div>

      {/* Action buttons */}
      <div className="sticky bottom-0 -mx-4 border-t border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)] px-4 py-4 md:static md:mx-0 md:border-0 md:px-0 md:pb-0">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 flex-1 rounded-lg border-[var(--destructive)] text-sm font-medium text-[var(--destructive)] hover:bg-red-50"
          >
            Reject
          </Button>
          <Button
            variant="outline"
            className="h-10 flex-1 rounded-lg border-[var(--intent-text-tertiary)] text-sm font-medium text-[var(--intent-text-primary)]"
          >
            Request more info
          </Button>
          <Button className="h-10 flex-1 rounded-lg bg-[var(--intent-amber)] text-sm font-medium text-white hover:bg-[var(--intent-amber-light)]">
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
