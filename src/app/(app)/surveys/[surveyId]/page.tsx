"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Check, ChevronLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Survey data                                                         */
/* ------------------------------------------------------------------ */

const TOTAL_QUESTIONS = 7;

const surveyData = {
  title: "Career fork",
  category: "POST-MBA PATH",
  currentQuestion: 4,
  question: "Where do you see yourself five years out?",
  options: [
    "Operating role at a venture-backed startup",
    "Founding my own company",
    "Returning to consulting at a senior level",
    "PE or VC investing",
  ],
};

/* ------------------------------------------------------------------ */
/* Progress segments                                                   */
/* ------------------------------------------------------------------ */

function ProgressSegments({
  total,
  filled,
}: {
  total: number;
  filled: number;
}) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            i < filled
              ? "bg-[var(--intent-amber)]"
              : "bg-[var(--intent-text-tertiary)]"
          )}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Radio option                                                        */
/* ------------------------------------------------------------------ */

function RadioOption({
  label,
  selected,
  onSelect,
  isLast,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  isLast: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3.5 px-1 py-4 text-left transition-colors",
          selected && "bg-transparent"
        )}
      >
        {/* Radio circle */}
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            selected
              ? "border-[var(--intent-amber)] bg-[var(--intent-amber)]"
              : "border-[var(--intent-text-tertiary)] bg-transparent"
          )}
        >
          {selected && <Check size={14} strokeWidth={3} className="text-white" />}
        </div>

        {/* Label */}
        <span
          className={cn(
            "text-[15px] leading-snug",
            selected
              ? "font-medium text-[var(--intent-text-primary)]"
              : "text-[var(--intent-text-secondary)]"
          )}
        >
          {label}
        </span>
      </button>
      {!isLast && (
        <div className="ml-10 h-px bg-[var(--intent-text-tertiary)]" />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ActiveSurveyPage() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<number>(0);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--intent-bg)]">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-4">
          <button
            onClick={() => router.back()}
            className="text-[14px] font-medium text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)] transition-colors"
          >
            Cancel
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-[var(--intent-text-primary)]">
            {surveyData.title}
          </h1>
          <button
            onClick={() => router.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--muted)] transition-colors"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
          </button>
        </div>
      </header>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[640px] flex-1 px-4 py-5">
        {/* Progress segments */}
        <ProgressSegments
          total={TOTAL_QUESTIONS}
          filled={surveyData.currentQuestion - 1}
        />

        {/* Question counter */}
        <p className="mt-3 text-[13px] text-[var(--intent-text-secondary)]">
          Question {surveyData.currentQuestion} of {TOTAL_QUESTIONS}
        </p>

        {/* Question card */}
        <div className="mt-4 intent-card rounded-3xl p-6">
          {/* Category label */}
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--intent-amber)]">
            {surveyData.category}
          </span>

          {/* Question text */}
          <h2 className="mt-3 text-[22px] font-semibold leading-tight text-[var(--intent-text-primary)]">
            {surveyData.question}
          </h2>

          {/* Options */}
          <div className="mt-6">
            {surveyData.options.map((option, i) => (
              <RadioOption
                key={i}
                label={option}
                selected={selectedOption === i}
                onSelect={() => setSelectedOption(i)}
                isLast={i === surveyData.options.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[var(--intent-amber-subtle)]/50 px-4 py-3">
          <Info
            size={16}
            strokeWidth={1.5}
            className="mt-0.5 shrink-0 text-[var(--intent-amber)]"
          />
          <p className="text-[13px] leading-relaxed text-[var(--intent-text-secondary)]">
            We'll group you with 4-6 ISB members who answered similarly and
            suggest a meetup in your city.
          </p>
        </div>
      </div>

      {/* ── Bottom navigation ──────────────────────────────────── */}
      <div
        className="sticky bottom-16 z-30 border-t bg-white/95 backdrop-blur-md safe-bottom"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex max-w-[640px] items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[14px] font-medium text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)] transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
            Back
          </button>
          <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--intent-amber)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)]">
            Next question
          </button>
        </div>
      </div>
    </div>
  );
}
