"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Camera,
  ChevronRight,
  Plus,
  Briefcase,
  Building2,
  X,
  Loader2,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { apiFetch } from "@/hooks/use-api";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
/* Niche pill with remove                                               */
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: user, isLoading } = useCurrentUser();

  const [intentText, setIntentText] = useState("");
  const [discoveryVisible, setDiscoveryVisible] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [userNiches, setUserNiches] = useState<{ id: string; displayName: string }[]>([]);
  const [formReady, setFormReady] = useState(false);

  // Experience add form
  const [showExpForm, setShowExpForm] = useState(false);
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpIsCurrent, setNewExpIsCurrent] = useState(false);

  // Niche add
  const [showNicheSelector, setShowNicheSelector] = useState(false);

  // Fetch all available niches
  const { data: availableNiches } = useQuery<{ id: string; displayName: string }[]>({
    queryKey: ["all-niches"],
    queryFn: async () => {
      const res: { niches?: { id: string; displayName: string }[] } = await apiFetch("/api/discovery/filters");
      return res?.niches ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Initialize form state
  useEffect(() => {
    if (user && !formReady) {
      setIntentText(user.profile?.missionStatement ?? "");
      setDiscoveryVisible(user.profile?.isVisibleInDiscovery ?? true);
      setPhotoPreview(user.photoUrl);
      setUserNiches(user.niches.map((n) => ({ id: n.niche.id, displayName: n.niche.displayName })));
      setFormReady(true);
    }
  }, [user, formReady]);

  // Profile save mutation
  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiFetch("/api/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      router.push("/my-profile");
    },
  });

  // Experience add mutation
  const addExpMutation = useMutation({
    mutationFn: (data: { companyName: string; title: string; isCurrent?: boolean }) =>
      apiFetch("/api/users/me/experience", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setNewExpCompany("");
      setNewExpTitle("");
      setNewExpIsCurrent(false);
      setShowExpForm(false);
    },
  });

  // Experience delete mutation
  const deleteExpMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch("/api/users/me/experience", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  // Niches update mutation
  const updateNichesMutation = useMutation({
    mutationFn: (nicheIds: string[]) =>
      apiFetch("/api/users/me/niches", {
        method: "PUT",
        body: JSON.stringify({ nicheIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      missionStatement: intentText,
      isVisibleInDiscovery: discoveryVisible,
    };
    // Include photo if changed
    if (photoPreview !== user?.photoUrl) {
      payload.photoUrl = photoPreview;
    }
    saveMutation.mutate(payload);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNiche = (nicheId: string) => {
    const updated = userNiches.filter((n) => n.id !== nicheId);
    setUserNiches(updated);
    if (updated.length > 0) {
      updateNichesMutation.mutate(updated.map((n) => n.id));
    }
  };

  const handleAddNiche = (niche: { id: string; displayName: string }) => {
    if (userNiches.length >= 5) return;
    if (userNiches.some((n) => n.id === niche.id)) return;
    const updated = [...userNiches, niche];
    setUserNiches(updated);
    updateNichesMutation.mutate(updated.map((n) => n.id));
    setShowNicheSelector(false);
  };

  const maxChars = 200;
  const charCount = intentText.length;

  // Loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--intent-bg)]">
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--intent-text-tertiary)] bg-white/95 px-4 backdrop-blur-md safe-top">
          <button onClick={() => router.back()} className="text-[14px] font-medium text-[var(--intent-text-primary)] hover:opacity-70">Cancel</button>
          <h1 className="text-[16px] font-semibold text-[var(--intent-text-primary)]">Edit profile</h1>
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
          </div>
        </div>
      </div>
    );
  }

  // Build display helpers
  const currentExp = user.experience.find((e) => e.isCurrent);
  const currentRole = currentExp?.title ?? "";
  const currentCompany = currentExp?.company?.name ?? currentExp?.freeTextCompanyName ?? "";

  // Signal counts
  const askCount = user.openSignals.filter((s) => s.isOpen && s.tenantSignal.template.signalType.toLowerCase() === "ask").length;
  const offerCount = user.openSignals.filter((s) => s.isOpen && s.tenantSignal.template.signalType.toLowerCase() === "offer").length;
  const mutualCount = user.openSignals.filter((s) => s.isOpen && s.tenantSignal.template.signalType.toLowerCase() === "mutual").length;

  // Available niches not yet selected
  const selectableNiches = (availableNiches ?? []).filter(
    (n) => !userNiches.some((un) => un.id === n.id)
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
        {saveMutation.isError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">Failed to save. Please try again.</p>
          </div>
        )}

        {/* Photo section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <AvatarPlaceholder name={user.fullName} size={96} />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--intent-navy)] shadow-sm hover:bg-[var(--intent-navy-light)] transition-colors"
            >
              <Camera size={14} className="text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-[14px] font-medium text-[var(--intent-navy)] hover:underline"
          >
            Change photo
          </button>
        </div>

        {/* Your Intent */}
        <SectionHeader title="Your Intent" />
        <div className="rounded-2xl bg-white p-4 shadow-[var(--card-shadow)]">
          <Textarea
            value={intentText}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) setIntentText(e.target.value);
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
                <Briefcase size={16} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-[var(--intent-text-primary)]">{currentRole}</p>
                <p className="text-[12px] text-[var(--intent-text-secondary)]">{currentCompany} &middot; Current</p>
              </div>
              <button
                onClick={() => deleteExpMutation.mutate(currentExp.id)}
                disabled={deleteExpMutation.isPending}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={14} className="text-[var(--intent-text-secondary)] hover:text-red-500" />
              </button>
            </div>
          )}
          {user.experience
            .filter((exp) => !exp.isCurrent)
            .map((exp) => (
              <div key={exp.id} className="flex min-h-[56px] items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
                  <Building2 size={16} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[var(--intent-text-primary)]">{exp.title}</p>
                  <p className="text-[12px] text-[var(--intent-text-secondary)]">
                    {exp.company?.name ?? exp.freeTextCompanyName ?? ""}
                  </p>
                </div>
                <button
                  onClick={() => deleteExpMutation.mutate(exp.id)}
                  disabled={deleteExpMutation.isPending}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X size={14} className="text-[var(--intent-text-secondary)] hover:text-red-500" />
                </button>
              </div>
            ))}

          {/* Add experience form */}
          {showExpForm ? (
            <div className="px-4 py-3 space-y-3">
              <div className="flex gap-3">
                <Input
                  placeholder="Company"
                  value={newExpCompany}
                  onChange={(e) => setNewExpCompany(e.target.value)}
                  className="h-10 flex-1 rounded-lg text-sm"
                />
                <Input
                  placeholder="Title"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="h-10 flex-1 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[13px] text-[var(--intent-text-secondary)]">
                  <Switch checked={newExpIsCurrent} onCheckedChange={setNewExpIsCurrent} />
                  Latest role
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowExpForm(false); setNewExpCompany(""); setNewExpTitle(""); }}
                    className="text-[13px] text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newExpCompany.trim() && newExpTitle.trim()) {
                        addExpMutation.mutate({ companyName: newExpCompany.trim(), title: newExpTitle.trim(), isCurrent: newExpIsCurrent });
                      }
                    }}
                    disabled={!newExpCompany.trim() || !newExpTitle.trim() || addExpMutation.isPending}
                    className="text-[13px] font-semibold text-[var(--intent-navy)] disabled:opacity-40"
                  >
                    {addExpMutation.isPending ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[48px] items-center justify-center px-4 py-3">
              <button
                onClick={() => setShowExpForm(true)}
                className="flex items-center gap-2 text-[14px] font-medium text-[var(--intent-navy)] hover:underline"
              >
                <Plus size={16} strokeWidth={2} />
                Add experience
              </button>
            </div>
          )}
        </div>

        {/* Domain and niches */}
        <SectionHeader title="Domain and interests" />
        <div className="rounded-2xl bg-white p-4 shadow-[var(--card-shadow)]">
          <div className="flex min-h-[44px] items-center gap-3">
            <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">Domain</span>
            <span className="max-w-[50%] truncate text-right text-[13px] text-[var(--intent-text-secondary)]">
              {user.profile?.domain?.displayName ?? ""}
            </span>
          </div>
          <div className="border-t border-[var(--intent-text-tertiary)] px-0 py-3">
            <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-[var(--intent-text-secondary)]">
              Interests
            </p>
            <div className="flex flex-wrap gap-2">
              {userNiches.map((niche) => (
                <NichePill
                  key={niche.id}
                  label={niche.displayName}
                  onRemove={() => handleRemoveNiche(niche.id)}
                />
              ))}
              {userNiches.length < 5 && !showNicheSelector && (
                <button
                  onClick={() => setShowNicheSelector(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--intent-text-tertiary)] px-3 py-1.5 text-[12px] font-medium text-[var(--intent-navy)] transition-colors hover:border-[var(--intent-navy)] hover:bg-[var(--intent-navy-subtle)]"
                >
                  <Plus size={12} strokeWidth={2} />
                  Add interest
                </button>
              )}
            </div>
            {showNicheSelector && (
              <div className="mt-3 rounded-xl border border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)] p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[12px] font-medium text-[var(--intent-text-secondary)]">Select an interest</p>
                  <button onClick={() => setShowNicheSelector(false)} className="text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto">
                  {selectableNiches.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleAddNiche(n)}
                      className="rounded-full bg-white border border-[var(--intent-text-tertiary)] px-2.5 py-1 text-[12px] font-medium text-[var(--intent-text-primary)] hover:border-[var(--intent-navy)] hover:bg-[var(--intent-navy-subtle)] transition-colors"
                    >
                      {n.displayName}
                    </button>
                  ))}
                  {selectableNiches.length === 0 && (
                    <p className="text-[12px] text-[var(--intent-text-secondary)]">No more interests available</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Asks / Offers / Mutuals */}
        <SectionHeader title="Asks, Offers & Mutuals" />
        <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white shadow-[var(--card-shadow)]">
          <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
            <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">Asks</span>
            <span className="text-[13px] text-[var(--intent-text-secondary)]">{askCount} active</span>
            <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-[var(--intent-text-secondary)]" />
          </div>
          <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
            <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">Offers</span>
            <span className="text-[13px] text-[var(--intent-text-secondary)]">{offerCount} active</span>
            <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-[var(--intent-text-secondary)]" />
          </div>
          <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
            <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">Mutuals</span>
            <span className="text-[13px] text-[var(--intent-text-secondary)]">{mutualCount} active</span>
            <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-[var(--intent-text-secondary)]" />
          </div>
        </div>

        {/* Visibility */}
        <SectionHeader title="Visibility" />
        <div className="flex min-h-[56px] items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[var(--card-shadow)]">
          <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">
            Visible in discovery
          </span>
          <Switch checked={discoveryVisible} onCheckedChange={setDiscoveryVisible} />
        </div>

        {/* City */}
        {user.profile?.currentCity && (
          <>
            <SectionHeader title="City" />
            <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--card-shadow)]">
              <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
                <span className="flex-1 text-[14px] text-[var(--intent-text-primary)]">City</span>
                <span className="text-[13px] text-[var(--intent-text-secondary)]">{user.profile.currentCity}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
