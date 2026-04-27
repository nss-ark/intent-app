"use client";

import { useState } from "react";
import { Lightbulb, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "ui-ux", label: "UI / UX" },
  { value: "discovery", label: "Discovery" },
  { value: "nudges", label: "Nudges & Chat" },
  { value: "surveys", label: "Surveys & Matching" },
  { value: "gamification", label: "Gamification" },
  { value: "admin", label: "Admin Panel" },
  { value: "other", label: "Other" },
];

export function FeatureRequestDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setStatus("idle");
    setErrorMsg("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/feature-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), category }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setStatus("error");
        setErrorMsg(data.error?.message || "Something went wrong");
        return;
      }

      setStatus("success");
      setTimeout(() => {
        setOpen(false);
        reset();
      }, 1500);
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger
        render={
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--intent-text-tertiary)] bg-white transition-colors hover:bg-[var(--muted)]"
            aria-label="Feature request"
          />
        }
      >
        <Lightbulb size={18} strokeWidth={1.5} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {status === "success" ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle2 size={40} className="text-[var(--intent-green)]" />
            <p className="text-center text-sm font-medium text-[var(--intent-text-primary)]">
              Thanks! Your request has been submitted.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request a feature</DialogTitle>
              <DialogDescription>
                Tell us what would make Intent better. This creates an issue on our GitHub repository.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--intent-text-secondary)]">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Add dark mode support"
                  maxLength={100}
                  className="w-full rounded-lg border border-[var(--intent-text-tertiary)] bg-white px-3 py-2 text-sm text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)] outline-none focus:border-[var(--intent-amber)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--intent-text-secondary)]">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(category === cat.value ? "" : cat.value)}
                      className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                        category === cat.value
                          ? "bg-[var(--intent-amber)] text-white"
                          : "bg-[var(--intent-amber-subtle)] text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--intent-text-secondary)]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the feature and why it would be useful..."
                  rows={3}
                  maxLength={1000}
                  className="w-full resize-none rounded-lg border border-[var(--intent-text-tertiary)] bg-white px-3 py-2 text-sm text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)] outline-none focus:border-[var(--intent-amber)]"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600">{errorMsg}</p>
              )}
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" size="sm" />}>
                Cancel
              </DialogClose>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!title.trim() || status === "submitting"}
                className="bg-[var(--intent-amber)] text-white hover:bg-[var(--intent-amber-light)]"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit request"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
