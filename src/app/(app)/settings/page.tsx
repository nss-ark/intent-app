"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Bell,
  Mail,
  Moon,
  Clock,
  Eye,
  MapPin,
  Users,
  Phone,
  AtSign,
  Lock,
  Link2,
  Download,
  FileCheck,
  Trash2,
  HelpCircle,
  MessageCircle,
  FileText,
  Shield,
  Info,
  LogOut,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

/* ------------------------------------------------------------------ */
/* Section heading                                                      */
/* ------------------------------------------------------------------ */

function SectionHeading({ title }: { title: string }) {
  return (
    <h3 className="mb-2 mt-8 px-4 text-[11px] font-semibold uppercase tracking-widest text-[var(--intent-text-secondary)]">
      {title}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* Toggle row                                                           */
/* ------------------------------------------------------------------ */

function ToggleRow({
  icon: Icon,
  label,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex h-14 items-center gap-3 px-4">
      <Icon
        size={18}
        strokeWidth={1.5}
        className="shrink-0 text-[var(--intent-text-secondary)]"
      />
      <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chevron row                                                          */
/* ------------------------------------------------------------------ */

function ChevronRow({
  icon: Icon,
  label,
  caption,
  destructive = false,
}: {
  icon: React.ElementType;
  label: string;
  caption?: string;
  destructive?: boolean;
}) {
  return (
    <div className="flex min-h-[56px] items-center gap-3 px-4 py-2">
      <Icon
        size={18}
        strokeWidth={1.5}
        className={
          destructive
            ? "shrink-0 text-[var(--destructive)]"
            : "shrink-0 text-[var(--intent-text-secondary)]"
        }
      />
      <div className="min-w-0 flex-1">
        <span
          className={
            destructive
              ? "text-[14px] font-medium text-[var(--destructive)]"
              : "text-[14px] text-[var(--intent-text-primary)]"
          }
        >
          {label}
        </span>
        {caption && (
          <p className="mt-0.5 text-[12px] leading-tight text-[var(--intent-text-secondary)]">
            {caption}
          </p>
        )}
      </div>
      <ChevronRight
        size={18}
        strokeWidth={1.5}
        className="shrink-0 text-[var(--intent-text-secondary)]"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                       */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const router = useRouter();

  // Notification toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Privacy toggles
  const [discoveryVisible, setDiscoveryVisible] = useState(true);
  const [showCity, setShowCity] = useState(true);
  const [allowNudges, setAllowNudges] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--intent-text-tertiary)] bg-white/95 px-4 backdrop-blur-md safe-top">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
          aria-label="Go back"
        >
          <ArrowLeft
            size={22}
            strokeWidth={1.5}
            className="text-[var(--intent-text-primary)]"
          />
        </button>
        <h1 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">
          Settings
        </h1>
        <div className="w-10" />
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] pb-32">
        {/* NOTIFICATIONS */}
        <SectionHeading title="Notifications" />
        <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white mx-4 shadow-[var(--card-shadow)]">
          <ToggleRow
            icon={Bell}
            label="Push notifications"
            checked={pushEnabled}
            onCheckedChange={setPushEnabled}
          />
          <ToggleRow
            icon={Mail}
            label="Email notifications"
            checked={emailEnabled}
            onCheckedChange={setEmailEnabled}
          />
          <ChevronRow icon={Moon} label="Quiet hours" />
          <ChevronRow icon={Clock} label="Digest frequency" />
        </div>

        {/* PRIVACY */}
        <SectionHeading title="Privacy" />
        <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white mx-4 shadow-[var(--card-shadow)]">
          <ToggleRow
            icon={Eye}
            label="Visible in discovery"
            checked={discoveryVisible}
            onCheckedChange={setDiscoveryVisible}
          />
          <ToggleRow
            icon={MapPin}
            label="Show city"
            checked={showCity}
            onCheckedChange={setShowCity}
          />
          <ToggleRow
            icon={Users}
            label="Allow student nudges"
            checked={allowNudges}
            onCheckedChange={setAllowNudges}
          />
        </div>

        {/* ACCOUNT */}
        <SectionHeading title="Account" />
        <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white mx-4 shadow-[var(--card-shadow)]">
          <ChevronRow icon={Phone} label="Change phone" />
          <ChevronRow icon={AtSign} label="Change email" />
          <ChevronRow icon={Lock} label="Change password" />
          <ChevronRow icon={Link2} label="Linked accounts" />
        </div>

        {/* DATA AND PRIVACY (DPDPA) */}
        <SectionHeading title="Data and Privacy (DPDPA)" />
        <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white mx-4 shadow-[var(--card-shadow)]">
          <ChevronRow
            icon={Download}
            label="Download my data"
            caption="Request an export of all your personal data"
          />
          <ChevronRow icon={FileCheck} label="Manage consents" />
          <ChevronRow
            icon={Trash2}
            label="Delete my account"
            destructive
          />
        </div>

        {/* HELP */}
        <SectionHeading title="Help" />
        <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white mx-4 shadow-[var(--card-shadow)]">
          <ChevronRow icon={HelpCircle} label="Help center" />
          <ChevronRow icon={MessageCircle} label="Contact support" />
          <ChevronRow icon={FileText} label="Terms" />
          <ChevronRow icon={Shield} label="Privacy Policy" />
        </div>

        {/* ABOUT */}
        <SectionHeading title="About" />
        <div className="overflow-hidden rounded-2xl bg-white mx-4 shadow-[var(--card-shadow)]">
          <div className="flex h-14 items-center gap-3 px-4">
            <Info
              size={18}
              strokeWidth={1.5}
              className="shrink-0 text-[var(--intent-text-secondary)]"
            />
            <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
              Version
            </span>
            <span className="text-[13px] text-[var(--intent-text-secondary)]">
              1.0.0 (build 47)
            </span>
          </div>
        </div>

        {/* Sign out */}
        <div className="mt-10 flex justify-center">
          <button className="text-[15px] font-semibold text-[var(--destructive)] hover:opacity-70">
            <span className="flex items-center gap-2">
              <LogOut size={18} strokeWidth={1.5} />
              Sign out
            </span>
          </button>
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
