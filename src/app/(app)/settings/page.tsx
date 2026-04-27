"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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
  Loader2,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser } from "@/hooks/use-current-user";
import { apiFetch } from "@/hooks/use-api";

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
  onClick,
  loading = false,
}: {
  icon: React.ElementType;
  label: string;
  caption?: string;
  destructive?: boolean;
  onClick?: () => void;
  loading?: boolean;
}) {
  const content = (
    <>
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
      {loading ? (
        <Loader2
          size={18}
          strokeWidth={1.5}
          className="shrink-0 animate-spin text-[var(--intent-text-secondary)]"
        />
      ) : (
        <ChevronRight
          size={18}
          strokeWidth={1.5}
          className="shrink-0 text-[var(--intent-text-secondary)]"
        />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex w-full min-h-[56px] items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-[var(--muted)] disabled:opacity-60"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex min-h-[56px] items-center gap-3 px-4 py-2">
      {content}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                       */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();

  // Notification toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  // Privacy toggles
  const [discoveryVisible, setDiscoveryVisible] = useState(true);
  const [showCity, setShowCity] = useState(true);
  const [allowNudges, setAllowNudges] = useState(true);

  // DPDPA loading states
  const [downloadingData, setDownloadingData] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sync privacy toggles from server data
  useEffect(() => {
    if (user?.profile) {
      setDiscoveryVisible(user.profile.isVisibleInDiscovery);
      setAllowNudges(user.profile.acceptingNewConversations);
    }
  }, [user?.profile]);

  // Privacy toggle handlers — persist to server
  const handleDiscoveryToggle = useCallback(async (checked: boolean) => {
    setDiscoveryVisible(checked);
    try {
      await apiFetch("/api/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify({ isVisibleInDiscovery: checked }),
      });
    } catch {
      // Revert on failure
      setDiscoveryVisible(!checked);
    }
  }, []);

  const handleAllowNudgesToggle = useCallback(async (checked: boolean) => {
    setAllowNudges(checked);
    try {
      await apiFetch("/api/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify({ acceptingNewConversations: checked }),
      });
    } catch {
      // Revert on failure
      setAllowNudges(!checked);
    }
  }, []);

  // Download my data handler
  const handleDownloadData = useCallback(async () => {
    setDownloadingData(true);
    try {
      const res = await fetch("/api/users/me/data-export", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "intent-data-export.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Data export error:", err);
      alert("Failed to download your data. Please try again.");
    } finally {
      setDownloadingData(false);
    }
  }, []);

  // Delete my account handler
  const handleDeleteAccount = useCallback(async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone. All your personal data will be anonymized."
    );
    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      await apiFetch("/api/users/me/delete-account", { method: "POST" });
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Account deletion error:", err);
      alert("Failed to delete your account. Please try again.");
      setDeletingAccount(false);
    }
  }, []);

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
            onCheckedChange={handleDiscoveryToggle}
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
            onCheckedChange={handleAllowNudgesToggle}
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
            onClick={handleDownloadData}
            loading={downloadingData}
          />
          <ChevronRow icon={FileCheck} label="Manage consents" />
          <ChevronRow
            icon={Trash2}
            label="Delete my account"
            destructive
            onClick={handleDeleteAccount}
            loading={deletingAccount}
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
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-[15px] font-semibold text-[var(--destructive)] hover:opacity-70"
          >
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
