"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Camera,
  ChevronRight,
  Plus,
  Briefcase,
  Building2,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { apiFetch } from "@/hooks/use-api";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

/* ------------------------------------------------------------------ */
/* Section header                                                       */
/* ------------------------------------------------------------------ */

function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mb-2 mt-6 text-[13px] font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
      {title}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* Setting row (label + right content + optional chevron)               */
/* ------------------------------------------------------------------ */

function EditRow({
  label,
  value,
  hasChevron = true,
}: {
  label: string;
  value?: string;
  hasChevron?: boolean;
}) {
  return (
    <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
      <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
        {label}
      </span>
      {value && (
        <span className="max-w-[50%] truncate text-right text-[13px] text-[var(--intent-text-secondary)]">
          {value}
        </span>
      )}
      {hasChevron && (
        <ChevronRight
          size={18}
          strokeWidth={1.5}
          className="shrink-0 text-[var(--intent-text-secondary)]"
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Niche pill                                                           */
/* ------------------------------------------------------------------ */

function NichePill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--muted)] px-3 py-1.5 text-[12px] font-medium text-[var(--intent-text-primary)]">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
        aria-label={`Remove ${label}`}
      >
        &times;
      </button>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                       */
/* ------------------------------------------------------------------ */

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();

  const [intentText, setIntentText] = useState("");
  const [discoveryVisible, setDiscoveryVisible] = useState(true);
  const [niches, setNiches] = useState<string[]>([]);
  const [formReady, setFormReady] = useState(false);

  // Initialize form state when user data arrives
  useEffect(() => {
    if (user && !formReady) {
      setIntentText(user.profile?.missionStatement ?? "");
      setDiscoveryVisible(user.profile?.isVisibleInDiscovery ?? true);
      setNiches(user.niches.map((n) => n.niche.displayName));
      setFormReady(true);
    }
  }, [user, formReady]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: {
      missionStatement: string;
      isVisibleInDiscovery: boolean;
    }) =>
      apiFetch("/api/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/my-profile");
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      missionStatement: intentText,
      isVisibleInDiscovery: discoveryVisible,
    });
  };

  const maxChars = 200;
  const charCount = intentText.length;

  function handleRemoveNiche(niche: string) {
    setNiches((prev) => prev.filter((n) => n !== niche));
  }

  // ── Loading state ───────────────────────────────────────────────────

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--intent-bg)]">
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--intent-text-tertiary)] bg-white/95 px-4 backdrop-blur-md safe-top">
          <button
            onClick={() => router.back()}
            className="text-[14px] font-medium text-[var(--intent-text-primary)] hover:opacity-70"
          >
            Cancel
          </button>
          <h1 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">
            Edit profile
          </h1>
          <div className="w-10" />
        </div>
        <div className="mx-auto max-w-[640px] px-4 pt-6">
          <div className="animate-pulse space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-[var(--muted)]" />
              <div className="mt-3 h-4 w-24 rounded bg-[var(--muted)]" />
            </div>
            <div className="h-4 w-28 rounded bg-[var(--muted)]" />
            <div className="h-[120px] rounded-2xl bg-[var(--muted)]" />
            <div className="h-4 w-20 rounded bg-[var(--muted)]" />
            <div className="h-[100px] rounded-2xl bg-[var(--muted)]" />
          </div>
        </div>
      </div>
    );
  }

  // Build display helpers from API data
  const currentExp = user.experience.find((e) => e.isCurrent);
  const currentRole = currentExp?.title ?? "";
  const currentCompany =
    currentExp?.company?.name ?? currentExp?.freeTextCompanyName ?? "";

  // Count open signals by type
  const askSignals = user.openSignals.filter(
    (s) => s.isOpen && s.tenantSignal.template.signalType.toLowerCase() === "ask"
  );
  const offerSignals = user.openSignals.filter(
    (s) =>
      s.isOpen && s.tenantSignal.template.signalType.toLowerCase() === "offer"
  );
  const mutualSignals = user.openSignals.filter(
    (s) =>
      s.isOpen &&
      s.tenantSignal.template.signalType.toLowerCase() === "mutual"
  );

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--intent-text-tertiary)] bg-white/95 px-4 backdrop-blur-md safe-top">
        <button
          onClick={() => router.back()}
          className="text-[14px] font-medium text-[var(--intent-text-primary)] hover:opacity-70"
        >
          Cancel
        </button>
        <h1 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">
          Edit profile
        </h1>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="text-[14px] font-semibold text-[var(--intent-navy)] hover:opacity-70 disabled:opacity-50"
        >
          {saveMutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pb-32 pt-6">
        {/* Save error */}
        {saveMutation.isError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">
              {saveMutation.error instanceof Error
                ? saveMutation.error.message
                : "Failed to save. Please try again."}
            </p>
          </div>
        )}

        {/* Photo section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <AvatarPlaceholder
                name={user.fullName}
                size={96}
              />
            )}
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--intent-navy)] shadow-sm">
              <Camera size={14} className="text-white" />
            </div>
          </div>
          <button className="mt-3 text-[14px] font-medium text-[var(--intent-navy)] hover:underline">
            Change photo
          </button>
        </div>

        {/* Your Intent */}
        <SectionHeader title="Your Intent" />
        <div className="rounded-2xl bg-white p-4 shadow-[var(--card-shadow)]">
          <Textarea
            value={intentText}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                setIntentText(e.target.value);
              }
            }}
            placeholder="Describe what you're working on and looking for..."
            className="min-h-[100px] resize-none border-none bg-transparent text-[14px] leading-relaxed shadow-none focus-visible:ring-0"
            maxLength={maxChars}
          />
          <div className="mt-2 text-right text-[12px] text-[var(--intent-text-secondary)]">
            {charCount} / {maxChars}
          </div>
        </div>

        {/* Career */}
        <SectionHeader title="Career" />
        <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white shadow-[var(--card-shadow)]">
          {currentExp && (
            <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
                <Briefcase
                  size={16}
                  strokeWidth={1.5}
                  className="text-[var(--intent-text-secondary)]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-[var(--intent-text-primary)]">
                  {currentRole}
                </p>
                <p className="text-[12px] text-[var(--intent-text-secondary)]">
                  {currentCompany} &middot; Current
                </p>
              </div>
              <ChevronRight
                size={18}
                strokeWidth={1.5}
                className="shrink-0 text-[var(--intent-text-secondary)]"
              />
            </div>
          )}
          {user.experience
            .filter((exp) => !exp.isCurrent)
            .map((exp) => (
              <div
                key={exp.id}
                className="flex min-h-[56px] items-center gap-3 px-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
                  <Building2
                    size={16}
                    strokeWidth={1.5}
                    className="text-[var(--intent-text-secondary)]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[var(--intent-text-primary)]">
                    {exp.title}
                  </p>
                  <p className="text-[12px] text-[var(--intent-text-secondary)]">
                    {exp.company?.name ?? exp.freeTextCompanyName ?? ""}
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 text-[var(--intent-text-secondary)]"
                />
              </div>
            ))}
          <div className="flex min-h-[48px] items-center justify-center px-4 py-3">
            <button className="flex items-center gap-2 text-[14px] font-medium text-[var(--intent-navy)] hover:underline">
              <Plus size={16} strokeWidth={2} />
              Add experience
            </button>
          </div>
        </div>

        {/* Domain and niches */}
        <SectionHeader title="Domain and niches" />
        <div className="rounded-2xl bg-white p-4 shadow-[var(--card-shadow)]">
          <EditRow
            label="Domain"
            value={user.profile?.domain?.displayName ?? ""}
          />
          <div className="border-t border-[var(--intent-text-tertiary)] px-4 py-3">
            <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Niches
            </p>
            <div className="flex flex-wrap gap-2">
              {niches.map((niche) => (
                <NichePill
                  key={niche}
                  label={niche}
                  onRemove={() => handleRemoveNiche(niche)}
                />
              ))}
              <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--intent-text-tertiary)] px-3 py-1.5 text-[12px] font-medium text-[var(--intent-navy)] transition-colors hover:border-[var(--intent-navy)] hover:bg-[var(--intent-navy-subtle)]">
                <Plus size={12} strokeWidth={2} />
                Add niche
              </button>
            </div>
          </div>
        </div>

        {/* Asks / Offers / Mutuals */}
        <SectionHeader title="Asks, Offers & Mutuals" />
        <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white shadow-[var(--card-shadow)]">
          <EditRow label="Asks" value={`${askSignals.length} active`} />
          <EditRow label="Offers" value={`${offerSignals.length} active`} />
          <EditRow label="Mutuals" value={`${mutualSignals.length} active`} />
        </div>

        {/* Visibility */}
        <SectionHeader title="Visibility" />
        <div className="flex min-h-[56px] items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[var(--card-shadow)]">
          <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
            Visible in discovery
          </span>
          <Switch
            checked={discoveryVisible}
            onCheckedChange={setDiscoveryVisible}
          />
        </div>

        {/* City */}
        <SectionHeader title="City" />
        <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--card-shadow)]">
          <EditRow
            label="City"
            value={user.profile?.currentCity ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
