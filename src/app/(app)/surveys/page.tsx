"use client";

import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSurveys, type SurveyListItem } from "@/hooks/use-surveys";
import { formatDistanceToNow } from "date-fns";

/* ------------------------------------------------------------------ */
/* Survey card                                                         */
/* ------------------------------------------------------------------ */

function SurveyCard({ survey }: { survey: SurveyListItem }) {
  const isCompleted = survey.hasResponded;
  const isActive = (survey.status === "PUBLISHED" || survey.status === "ACTIVE") && !isCompleted;
  const isUpcoming = survey.status === "DRAFT";

  const closesInLabel =
    survey.closesAt
      ? `Closes in ${formatDistanceToNow(new Date(survey.closesAt))}`
      : null;

  return (
    <div className="intent-card p-5">
      <div className="flex items-start justify-between gap-3">
        {/* Left: icon + info */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              isActive && "bg-[var(--intent-amber-subtle)]",
              isCompleted && "bg-[var(--intent-green-subtle)]",
              isUpcoming && "bg-[var(--muted)]"
            )}
          >
            {isCompleted ? (
              <CheckCircle2
                size={22}
                strokeWidth={1.5}
                className="text-[var(--intent-green)]"
              />
            ) : (
              <ClipboardList
                size={22}
                strokeWidth={1.5}
                className={cn(
                  isActive
                    ? "text-[var(--intent-amber)]"
                    : "text-[var(--intent-text-secondary)]"
                )}
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-[var(--intent-text-primary)]">
              {survey.title}
            </h3>
            {isActive && (
              <p className="mt-0.5 text-[13px] text-[var(--intent-text-secondary)]">
                {survey._count.questions} question{survey._count.questions !== 1 ? "s" : ""}
                {closesInLabel && <> &middot; {closesInLabel}</>}
              </p>
            )}
            {isCompleted && (
              <p className="mt-0.5 text-[13px] text-[var(--intent-text-secondary)]">
                Completed
              </p>
            )}
            {isUpcoming && survey.publishedAt && (
              <p className="mt-0.5 text-[13px] text-[var(--intent-text-secondary)]">
                Opens {formatDistanceToNow(new Date(survey.publishedAt), { addSuffix: true })}
              </p>
            )}
          </div>
        </div>

        {/* Right: action */}
        <div className="shrink-0 self-center">
          {isActive && (
            <Link
              href={`/surveys/${survey.id}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[var(--intent-amber)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)]"
            >
              Take survey
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          )}
          {isCompleted && (
            <span className="inline-flex h-7 items-center rounded-full bg-[var(--intent-green-subtle)] px-3 text-[12px] font-medium text-[var(--intent-green)]">
              Completed
            </span>
          )}
          {isUpcoming && (
            <span className="flex items-center gap-1 text-[13px] text-[var(--intent-text-secondary)]">
              <Clock size={14} strokeWidth={1.5} />
              Upcoming
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SurveysPage() {
  const { data: surveys, isLoading } = useSurveys();

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md safe-top"
        style={{ borderColor: "var(--intent-text-tertiary)" }}
      >
        <div className="mx-auto flex h-14 max-w-[640px] items-center justify-between px-4">
          <h1 className="text-[22px] font-bold text-[var(--intent-text-primary)]">
            Surveys
          </h1>
          <ClipboardList
            size={22}
            strokeWidth={1.5}
            className="text-[var(--intent-text-secondary)]"
          />
        </div>
      </header>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2
            size={28}
            className="animate-spin text-[var(--intent-amber)]"
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && surveys && surveys.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[15px] text-[var(--intent-text-secondary)]">
            No surveys available
          </p>
        </div>
      )}

      {/* Survey list */}
      {surveys && surveys.length > 0 && (
        <div className="mx-auto max-w-[640px] px-4 py-4 space-y-3">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      )}
    </div>
  );
}
