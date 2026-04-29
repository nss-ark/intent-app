"use client";

import {
  Settings,
  Shield,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";

/* ── Types ───────────────────────────────────────────────────────────── */

interface SuperAdminSession {
  email: string;
  name: string;
  role: string;
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const { data: session, isLoading } = useQuery<SuperAdminSession>({
    queryKey: ["superadmin-session"],
    queryFn: () => apiFetch("/api/superadmin/session"),
  });

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-xl font-semibold text-[var(--intent-text-primary)] md:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--intent-text-secondary)]">
          SuperAdmin account and platform settings.
        </p>
      </div>

      {/* Current admin info */}
      <div className="mb-6 rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="size-5 text-[var(--intent-green)]" strokeWidth={1.5} />
          <h2 className="font-heading text-base font-semibold text-[var(--intent-text-primary)]">
            Your Account
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-[var(--intent-green)]" />
          </div>
        ) : session ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--intent-green)] text-xs font-semibold text-white">
                {session.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--intent-text-primary)]">
                  {session.name}
                </p>
                <p className="text-xs text-[var(--intent-text-secondary)]">
                  {session.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[var(--intent-green-subtle)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--intent-green)]">
                {session.role}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--intent-text-secondary)]">
            Could not load session info.
          </p>
        )}
      </div>

      {/* Placeholder */}
      <div className="rounded-xl border border-dashed border-[var(--intent-text-tertiary)] bg-white p-8 text-center">
        <Settings
          className="mx-auto mb-3 size-10 text-[var(--intent-text-secondary)]"
          strokeWidth={1}
        />
        <h3 className="mb-1 font-heading text-base font-semibold text-[var(--intent-text-primary)]">
          SuperAdmin account management coming soon
        </h3>
        <p className="text-sm text-[var(--intent-text-secondary)]">
          Password changes, audit logs, and platform configuration will be available here.
        </p>
      </div>
    </div>
  );
}
