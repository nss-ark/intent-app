"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GripVertical,
  Pencil,
  Plus,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

/* ── Static data ──────────────────────────────────────────────────────── */

const themes = [
  "Career & Growth",
  "Entrepreneurship",
  "Networking",
  "Community Feedback",
  "Events & Meetups",
];

const audienceFilters = [
  { id: "students", label: "Current students", description: "Include current PGP/PGPMAX students" },
  { id: "graduates", label: "Recent graduates", description: "Graduated within last 2 years" },
  { id: "year", label: "Filter by class year", description: "Specific graduation years" },
  { id: "city", label: "Filter by city", description: "Target members in specific cities" },
];

const questions = [
  {
    id: "q1",
    number: 1,
    text: "What is your primary career goal for the next 12 months?",
    type: "Multiple choice",
  },
  {
    id: "q2",
    number: 2,
    text: "Which skills are you most interested in developing?",
    type: "Checkbox (multi-select)",
  },
  {
    id: "q3",
    number: 3,
    text: "Would you be interested in a peer-mentoring circle?",
    type: "Yes / No",
  },
];

/* ── Component ────────────────────────────────────────────────────────── */

export default function SurveyCreatePage() {
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [audienceToggles, setAudienceToggles] = useState<Record<string, boolean>>({
    students: true,
    graduates: true,
    year: false,
    city: false,
  });
  const [jaccardEnabled, setJaccardEnabled] = useState(true);
  const [diversityPenalty, setDiversityPenalty] = useState(false);
  const [groupSize, setGroupSize] = useState("4");
  const [matchCap, setMatchCap] = useState("3");
  const [publishDate, setPublishDate] = useState("");
  const [closeAfter, setCloseAfter] = useState("7");

  const toggleAudience = (id: string) => {
    setAudienceToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="mx-auto max-w-[700px] px-4 py-6 md:px-8 md:py-8">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin"
          className="text-sm font-medium text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)] transition-colors"
        >
          Cancel
        </Link>
        <h1 className="font-heading text-base font-semibold text-[var(--intent-text-primary)]">
          New survey
        </h1>
        <button className="text-sm font-medium text-[var(--intent-navy)] hover:underline">
          Save draft
        </button>
      </div>

      {/* ── BASICS ──────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
          Basics
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-sm text-[var(--intent-text-primary)]">
              Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Career Goals Survey 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 rounded-lg border-[var(--intent-text-tertiary)] bg-white text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="theme" className="text-sm text-[var(--intent-text-primary)]">
              Theme
            </Label>
            <div className="relative">
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-[var(--intent-text-tertiary)] bg-white px-3 pr-8 text-sm text-[var(--intent-text-primary)] outline-none focus:border-[var(--intent-navy)] focus:ring-2 focus:ring-[var(--intent-navy)]/20"
              >
                <option value="">Select a theme</option>
                {themes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--intent-text-secondary)]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-sm text-[var(--intent-text-primary)]">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what this survey is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] rounded-lg border-[var(--intent-text-tertiary)] bg-white text-sm"
            />
          </div>
        </div>
      </section>

      {/* ── AUDIENCE ────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
          Audience
        </h2>
        <div className="space-y-1">
          {audienceFilters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center justify-between rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[var(--intent-text-primary)]">
                  {filter.label}
                </p>
                <p className="text-xs text-[var(--intent-text-secondary)]">
                  {filter.description}
                </p>
              </div>
              <Switch
                checked={audienceToggles[filter.id] || false}
                onCheckedChange={() => toggleAudience(filter.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── QUESTIONS ───────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
          Questions
        </h2>
        <div className="space-y-2">
          {questions.map((q) => (
            <div
              key={q.id}
              className="flex items-start gap-3 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3"
            >
              <GripVertical
                className="mt-0.5 size-4 shrink-0 cursor-grab text-[var(--intent-text-secondary)]/50"
                strokeWidth={1.5}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--intent-text-primary)]">
                      <span className="mr-1.5 text-xs text-[var(--intent-text-secondary)]">
                        Q{q.number}.
                      </span>
                      {q.text}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--intent-text-secondary)]">
                      {q.type}
                    </p>
                  </div>
                  <button className="shrink-0 rounded-lg p-1.5 text-[var(--intent-navy)] hover:bg-[var(--intent-navy-subtle)] transition-colors">
                    <Pencil className="size-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--intent-navy)] hover:underline">
          <Plus className="size-3.5" />
          Add question
        </button>
      </section>

      {/* ── MATCHING ────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
          Matching
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--intent-text-primary)]">
                Jaccard overlap matching
              </p>
              <p className="text-xs text-[var(--intent-text-secondary)]">
                Group members with similar survey responses
              </p>
            </div>
            <Switch
              checked={jaccardEnabled}
              onCheckedChange={setJaccardEnabled}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-[var(--intent-text-primary)]">
                Diversity penalty
              </p>
              <p className="text-xs text-[var(--intent-text-secondary)]">
                Penalize same-program groupings for diversity
              </p>
            </div>
            <Switch
              checked={diversityPenalty}
              onCheckedChange={setDiversityPenalty}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="group-size"
                className="text-sm text-[var(--intent-text-primary)]"
              >
                Group size
              </Label>
              <div className="relative">
                <select
                  id="group-size"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-[var(--intent-text-tertiary)] bg-white px-3 pr-8 text-sm text-[var(--intent-text-primary)] outline-none focus:border-[var(--intent-navy)] focus:ring-2 focus:ring-[var(--intent-navy)]/20"
                >
                  {[3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={String(n)}>
                      {n} members
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--intent-text-secondary)]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="match-cap"
                className="text-sm text-[var(--intent-text-primary)]"
              >
                Match cap
              </Label>
              <div className="relative">
                <select
                  id="match-cap"
                  value={matchCap}
                  onChange={(e) => setMatchCap(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-[var(--intent-text-tertiary)] bg-white px-3 pr-8 text-sm text-[var(--intent-text-primary)] outline-none focus:border-[var(--intent-navy)] focus:ring-2 focus:ring-[var(--intent-navy)]/20"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={String(n)}>
                      {n} {n === 1 ? "group" : "groups"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--intent-text-secondary)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCHEDULE ────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--intent-text-secondary)]">
          Schedule
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="publish-date"
              className="text-sm text-[var(--intent-text-primary)]"
            >
              Publish date
            </Label>
            <div className="relative">
              <Input
                id="publish-date"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="h-10 rounded-lg border-[var(--intent-text-tertiary)] bg-white text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="close-after"
              className="text-sm text-[var(--intent-text-primary)]"
            >
              Close after
            </Label>
            <div className="relative">
              <select
                id="close-after"
                value={closeAfter}
                onChange={(e) => setCloseAfter(e.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-[var(--intent-text-tertiary)] bg-white px-3 pr-8 text-sm text-[var(--intent-text-primary)] outline-none focus:border-[var(--intent-navy)] focus:ring-2 focus:ring-[var(--intent-navy)]/20"
              >
                {[3, 5, 7, 10, 14, 21, 30].map((n) => (
                  <option key={n} value={String(n)}>
                    {n} days
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--intent-text-secondary)]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom actions ──────────────────────────────────────────────── */}
      <div className="sticky bottom-0 -mx-4 border-t border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)] px-4 py-4 md:static md:mx-0 md:border-0 md:px-0 md:pb-0">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-10 flex-1 rounded-lg border-[var(--intent-text-tertiary)] text-sm font-medium text-[var(--intent-text-primary)]"
          >
            Save and preview
          </Button>
          <Button className="h-10 flex-1 rounded-lg bg-[var(--intent-navy)] text-sm font-medium text-white hover:bg-[var(--intent-navy-light)]">
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
