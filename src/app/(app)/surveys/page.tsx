"use client";

import Link from "next/link";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Survey data                                                         */
/* ------------------------------------------------------------------ */

interface Survey {
  id: string;
  title: string;
  status: "active" | "completed" | "upcoming";
  questionCount?: number;
  estimatedSeconds?: number;
  closesIn?: string;
  opensOn?: string;
  completedGroup?: string;
}

const surveys: Survey[] = [
  {
    id: "career-fork",
    title: "Career Fork",
    status: "active",
    questionCount: 7,
    estimatedSeconds: 60,
    closesIn: "3 days",
  },
  {
    id: "values-alignment",
    title: "Values Alignment",
    status: "completed",
    completedGroup: "Group B",
  },
  {
    id: "post-grad-plans",
    title: "Post-graduation plans",
    status: "upcoming",
    opensOn: "Oct 20",
  },
];

/* ------------------------------------------------------------------ */
/* Survey card                                                         */
/* ------------------------------------------------------------------ */

function SurveyCard({ survey }: { survey: Survey }) {
  const isActive = survey.status === "active";
  const isCompleted = survey.status === "completed";
  const isUpcoming = survey.status === "upcoming";

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
                {survey.questionCount} questions &middot;{" "}
                {survey.estimatedSeconds} seconds &middot; Closes in{" "}
                {survey.closesIn}
              </p>
            )}
            {isCompleted && (
              <p className="mt-0.5 text-[13px] text-[var(--intent-text-secondary)]">
                You were matched into {survey.completedGroup}
              </p>
            )}
            {isUpcoming && (
              <p className="mt-0.5 text-[13px] text-[var(--intent-text-secondary)]">
                Opens {survey.opensOn}
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
              {survey.opensOn}
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

      {/* Survey list */}
      <div className="mx-auto max-w-[640px] px-4 py-4 space-y-3">
        {surveys.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
      </div>
    </div>
  );
}
