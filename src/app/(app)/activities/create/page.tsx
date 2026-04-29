"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import { apiFetch } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface FiltersResponse {
  niches: { id: string; code: string; displayName: string }[];
}

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const EVENT_TYPES = [
  "PANEL",
  "WORKSHOP",
  "REUNION",
  "DINNER",
  "TALK",
  "MEETUP",
  "OTHER",
] as const;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function CreateActivityPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<string>("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [selectedNicheIds, setSelectedNicheIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch niches
  const { data: filters } = useQuery<FiltersResponse>({
    queryKey: ["discovery-filters"],
    queryFn: () => apiFetch("/api/discovery/filters"),
    staleTime: 5 * 60 * 1000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<{ id: string }>("/api/events", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => {
      router.push(`/activities/${data.id}`);
    },
  });

  // Toggle niche selection
  const toggleNiche = (nicheId: string) => {
    setSelectedNicheIds((prev) =>
      prev.includes(nicheId)
        ? prev.filter((id) => id !== nicheId)
        : [...prev, nicheId]
    );
  };

  // Validate and submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!startsAt) newErrors.startsAt = "Start date & time is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const body: Record<string, unknown> = {
      title: title.trim(),
      startsAt: new Date(startsAt).toISOString(),
      visibility,
    };
    if (description.trim()) body.description = description.trim();
    if (eventType) body.eventType = eventType;
    if (endsAt) body.endsAt = new Date(endsAt).toISOString();
    if (location.trim()) body.location = location.trim();
    if (capacity) body.capacity = parseInt(capacity, 10);
    if (selectedNicheIds.length > 0) body.nicheIds = selectedNicheIds;

    createMutation.mutate(body);
  };

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex h-14 items-center border-b border-[var(--intent-text-tertiary)] bg-white/95 px-4 backdrop-blur-md safe-top">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
          aria-label="Go back"
        >
          <ChevronLeft
            size={22}
            strokeWidth={1.5}
            className="text-[var(--intent-text-primary)]"
          />
        </button>
        <h1 className="ml-2 text-[16px] font-semibold text-[var(--intent-text-primary)]">
          Create Activity
        </h1>
      </div>

      {/* ── Form ─────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-[640px] px-4 pb-32 pt-6"
      >
        {/* Title */}
        <div>
          <label className="text-[13px] font-medium text-[var(--intent-text-secondary)]">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Coffee & Careers Chat"
            className={cn(
              "mt-1 h-11 w-full rounded-xl border bg-white px-3 text-[14px] outline-none transition-colors focus:border-[var(--intent-amber)]",
              errors.title
                ? "border-[var(--intent-destructive)]"
                : "border-[var(--intent-text-tertiary)]"
            )}
          />
          {errors.title && (
            <p className="mt-1 text-[12px] text-[var(--intent-destructive)]">
              {errors.title}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-[13px] font-medium text-[var(--intent-text-secondary)]">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this activity about?"
            rows={4}
            className="mt-1 w-full rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[var(--intent-amber)] resize-none"
          />
        </div>

        {/* Event type */}
        <div className="mt-4">
          <label className="text-[13px] font-medium text-[var(--intent-text-secondary)]">
            Event Type
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="mt-1 h-11 w-full rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-3 text-[14px] outline-none transition-colors focus:border-[var(--intent-amber)]"
          >
            <option value="">Select type (optional)</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Date & time */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[13px] font-medium text-[var(--intent-text-secondary)]">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={cn(
                "mt-1 h-11 w-full rounded-xl border bg-white px-3 text-[14px] outline-none transition-colors focus:border-[var(--intent-amber)]",
                errors.startsAt
                  ? "border-[var(--intent-destructive)]"
                  : "border-[var(--intent-text-tertiary)]"
              )}
            />
            {errors.startsAt && (
              <p className="mt-1 text-[12px] text-[var(--intent-destructive)]">
                {errors.startsAt}
              </p>
            )}
          </div>
          <div>
            <label className="text-[13px] font-medium text-[var(--intent-text-secondary)]">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-3 text-[14px] outline-none transition-colors focus:border-[var(--intent-amber)]"
            />
          </div>
        </div>

        {/* Location */}
        <div className="mt-4">
          <label className="text-[13px] font-medium text-[var(--intent-text-secondary)]">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. ISB Hyderabad, Room 204"
            className="mt-1 h-11 w-full rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-3 text-[14px] outline-none transition-colors focus:border-[var(--intent-amber)]"
          />
        </div>

        {/* Capacity */}
        <div className="mt-4">
          <label className="text-[13px] font-medium text-[var(--intent-text-secondary)]">
            Capacity
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Leave empty for unlimited"
            min={1}
            className="mt-1 h-11 w-full rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-3 text-[14px] outline-none transition-colors focus:border-[var(--intent-amber)]"
          />
        </div>

        {/* Visibility toggle */}
        <div className="mt-4">
          <label className="text-[13px] font-medium text-[var(--intent-text-secondary)]">
            Visibility
          </label>
          <div className="mt-1 flex gap-1 rounded-xl bg-[var(--muted)] p-1">
            {(["PUBLIC", "PRIVATE"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-[14px] font-medium transition-all",
                  visibility === v
                    ? "bg-white text-[var(--intent-text-primary)] shadow-sm"
                    : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
                )}
              >
                {v === "PUBLIC" ? "Public" : "Private"}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[12px] text-[var(--intent-text-secondary)]">
            {visibility === "PUBLIC"
              ? "Visible to all community members"
              : "Only invited members can see and join"}
          </p>
        </div>

        {/* Niche selector */}
        {filters?.niches && filters.niches.length > 0 && (
          <div className="mt-4">
            <label className="text-[13px] font-medium text-[var(--intent-text-secondary)]">
              Link to Group Intents (optional)
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {filters.niches.map((niche) => (
                <button
                  key={niche.id}
                  type="button"
                  onClick={() => toggleNiche(niche.id)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                    selectedNicheIds.includes(niche.id)
                      ? "bg-[var(--intent-amber)] text-white"
                      : "bg-[var(--muted)] text-[var(--intent-text-secondary)] hover:bg-[var(--intent-amber-subtle)]"
                  )}
                >
                  {niche.displayName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {createMutation.isError && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-[13px] text-[var(--intent-destructive)]">
            {(createMutation.error as Error)?.message ??
              "Failed to create activity. Please try again."}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--intent-amber)] text-[15px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)] disabled:opacity-50"
        >
          {createMutation.isPending ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            "Create Activity"
          )}
        </button>
      </form>
    </div>
  );
}
