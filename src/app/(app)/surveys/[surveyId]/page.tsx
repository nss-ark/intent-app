"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { X, Check, ChevronLeft, Info, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSurvey, useSubmitSurvey } from "@/hooks/use-surveys";
import { format } from "date-fns";

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
  disabled,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  isLast: boolean;
  disabled?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onSelect}
        disabled={disabled}
        className={cn(
          "flex w-full items-center gap-3.5 px-1 py-4 text-left transition-colors",
          selected && "bg-transparent",
          disabled && "cursor-default"
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
  const params = useParams<{ surveyId: string }>();
  const surveyId = params.surveyId as string;

  const { data: survey, isLoading } = useSurvey(surveyId);
  const submitSurvey = useSubmitSurvey();

  // Track which question the user is on (0-indexed)
  const [currentIndex, setCurrentIndex] = useState(0);
  // Map of questionId -> selected optionId
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--intent-bg)]">
        <Loader2
          size={28}
          className="animate-spin text-[var(--intent-amber)]"
        />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--intent-bg)]">
        <p className="text-[15px] text-[var(--intent-text-secondary)]">
          Survey not found
        </p>
      </div>
    );
  }

  // If the user has already responded, show completed state
  if (survey.userResponse) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--intent-bg)]">
        {/* Top bar */}
        <header
          className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
          style={{ borderColor: "var(--intent-text-tertiary)" }}
        >
          <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-4">
            <button
              onClick={() => router.back()}
              className="text-[14px] font-medium text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)] transition-colors"
            >
              Back
            </button>
            <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-[var(--intent-text-primary)]">
              {survey.title}
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

        {/* Completed content */}
        <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--intent-green-subtle)]">
            <CheckCircle2 size={32} strokeWidth={1.5} className="text-[var(--intent-green)]" />
          </div>
          <h2 className="mt-4 text-[20px] font-semibold text-[var(--intent-text-primary)]">
            Survey completed
          </h2>
          <p className="mt-2 text-[14px] text-[var(--intent-text-secondary)]">
            You submitted your response on{" "}
            {format(new Date(survey.userResponse.submittedAt), "MMM d, yyyy")}
          </p>
          <button
            onClick={() => router.push("/surveys")}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--intent-amber)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)]"
          >
            Back to surveys
          </button>
        </div>
      </div>
    );
  }

  const questions = survey.questions.sort((a, b) => a.position - b.position);
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return null;
  }

  const selectedOptionId = answers[currentQuestion.id] ?? null;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  function handleSelectOption(optionId: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  }

  function handleNext() {
    if (isLastQuestion) {
      // Submit survey
      const answerPayload = Object.entries(answers).map(([questionId, optionId]) => ({
        questionId,
        optionId,
      }));
      submitSurvey.mutate(
        { surveyId, answers: answerPayload },
        {
          onSuccess: () => {
            // The query will refetch and show completed state
          },
        }
      );
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      router.back();
    }
  }

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
            {survey.title}
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
        <ProgressSegments total={totalQuestions} filled={currentIndex} />

        {/* Question counter */}
        <p className="mt-3 text-[13px] text-[var(--intent-text-secondary)]">
          Question {currentIndex + 1} of {totalQuestions}
        </p>

        {/* Question card */}
        <div className="mt-4 intent-card rounded-3xl p-6">
          {/* Category label */}
          {survey.matchingStrategy && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--intent-amber)]">
              {survey.matchingStrategy}
            </span>
          )}

          {/* Question text */}
          <h2 className="mt-3 text-[22px] font-semibold leading-tight text-[var(--intent-text-primary)]">
            {currentQuestion.questionText}
          </h2>

          {/* Options */}
          <div className="mt-6">
            {currentQuestion.options
              .sort((a, b) => a.position - b.position)
              .map((option, i) => (
                <RadioOption
                  key={option.id}
                  label={option.optionText}
                  selected={selectedOptionId === option.id}
                  onSelect={() => handleSelectOption(option.id)}
                  isLast={i === currentQuestion.options.length - 1}
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
            {survey.description ??
              "We'll use your answers to match you with like-minded members."}
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
            onClick={handleBack}
            className="flex items-center gap-1 text-[14px] font-medium text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)] transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedOptionId || submitSurvey.isPending}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--intent-amber)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)] disabled:opacity-50"
          >
            {submitSurvey.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isLastQuestion ? (
              "Submit"
            ) : (
              "Next question"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
