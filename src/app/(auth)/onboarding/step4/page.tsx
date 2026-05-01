"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  ClipboardCheck,
  Lightbulb,
  TrendingUp,
  Send,
  BookOpen,
  Coffee,
  Rocket,
  Users,
} from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { signalTemplates } from "@/config/brand";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Icon map                                                            */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
  "clipboard-check": ClipboardCheck,
  lightbulb: Lightbulb,
  "trending-up": TrendingUp,
  send: Send,
  "book-open": BookOpen,
  coffee: Coffee,
  rocket: Rocket,
  users: Users,
};

/* ------------------------------------------------------------------ */
/* Signal Card — compact sharp square                                  */
/* ------------------------------------------------------------------ */

function SignalCard({
  code,
  displayName,
  icon,
  checked,
  selectedBg,
  selectedBorder,
  onToggle,
}: {
  code: string;
  displayName: string;
  icon: string;
  checked: boolean;
  selectedBg: string;
  selectedBorder: string;
  onToggle: (code: string, value: boolean) => void;
}) {
  const Icon = iconMap[icon] ?? GraduationCap;

  return (
    <button
      type="button"
      onClick={() => onToggle(code, !checked)}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-200 ease-out select-none aspect-square",
        checked
          ? `${selectedBg} ${selectedBorder} shadow-md scale-[1.03]`
          : "border-[#D8DCE5] bg-white hover:border-[#B0B8C9] hover:shadow-sm active:scale-[0.97]"
      )}
    >
      <Icon
        size={18}
        className={cn(
          "transition-colors duration-200",
          checked ? "text-white" : "text-[#1B3A5F]"
        )}
      />
      <span
        className={cn(
          "text-[11px] font-semibold leading-tight transition-colors duration-200",
          checked ? "text-white" : "text-[#1A1A1A]"
        )}
      >
        {displayName}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function OnboardingStep4() {
  const router = useRouter();
  const [signals, setSignals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("intent_step4") || "{}");
      if (Object.keys(saved).length > 0) {
        setSignals(saved);
      } else {
        const defaults: Record<string, boolean> = {};
        signalTemplates.forEach((s) => {
          defaults[s.code] = s.defaultActive;
        });
        setSignals(defaults);
      }
    } catch {
      const defaults: Record<string, boolean> = {};
      signalTemplates.forEach((s) => {
        defaults[s.code] = s.defaultActive;
      });
      setSignals(defaults);
    }
  }, []);

  const toggleSignal = (code: string, value: boolean) => {
    setSignals((prev) => ({ ...prev, [code]: value }));
  };

  const asks = signalTemplates.filter((s) => s.type === "ask");
  const offers = signalTemplates.filter((s) => s.type === "offer");
  const mutuals = signalTemplates.filter((s) => s.type === "mutual");

  const handleFinish = () => {
    localStorage.setItem("intent_step4", JSON.stringify(signals));
    router.push("/onboarding/complete");
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-6 md:py-12">
      {/* Header */}
      <div className="w-full max-w-[640px] mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#6B6B66] hover:text-[#1A1A1A] transition-colors -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center flex-1 mt-6 md:mt-8">
        <IntentWordmark size="md" />

        <div className="w-full max-w-[640px] mt-6 md:mt-8">
          {/* Progress */}
          <ProgressBar totalSteps={4} currentStep={4} />
          <p className="mt-3 text-xs text-[#6B6B66] font-medium tracking-wide">
            Step 4 of 4 &middot; Signals
          </p>

          {/* Heading */}
          <div className="mt-8">
            <h1 className="text-xl md:text-2xl font-heading font-semibold text-[#1A1A1A] tracking-tight">
              Light your signals
            </h1>
            <p className="mt-2 text-sm text-[#6B6B66] leading-relaxed">
              Select what you&apos;re open to. Others will see these on your profile.
            </p>
          </div>

          {/* ── Your Intent ───────────────────────────────────────── */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-6 rounded-full bg-[#1B3A5F]" />
              <h2 className="text-sm font-semibold text-[#1A1A1A]">
                Your Intent
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {asks.map((signal) => (
                <SignalCard
                  key={signal.code}
                  code={signal.code}
                  displayName={signal.displayName}
                  icon={signal.icon}
                  checked={signals[signal.code] ?? false}
                  selectedBg="bg-[#1B3A5F]"
                  selectedBorder="border-[#2E6399]"
                  onToggle={toggleSignal}
                />
              ))}
            </div>
          </div>

          {/* ── Your Impact ───────────────────────────────────────── */}
          <div className="mt-7">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-6 rounded-full bg-[#2D4A3A]" />
              <h2 className="text-sm font-semibold text-[#1A1A1A]">
                Your Impact
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {offers.map((signal) => (
                <SignalCard
                  key={signal.code}
                  code={signal.code}
                  displayName={signal.displayName}
                  icon={signal.icon}
                  checked={signals[signal.code] ?? false}
                  selectedBg="bg-[#2D4A3A]"
                  selectedBorder="border-[#3D6B52]"
                  onToggle={toggleSignal}
                />
              ))}
            </div>
          </div>

          {/* ── Let's connect ─────────────────────────────────────── */}
          <div className="mt-7">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-6 rounded-full bg-[#4A3A6B]" />
              <h2 className="text-sm font-semibold text-[#1A1A1A]">
                Let&apos;s connect
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {mutuals.map((signal) => (
                <SignalCard
                  key={signal.code}
                  code={signal.code}
                  displayName={signal.displayName}
                  icon={signal.icon}
                  checked={signals[signal.code] ?? false}
                  selectedBg="bg-[#4A3A6B]"
                  selectedBorder="border-[#7C5FA8]"
                  onToggle={toggleSignal}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-10 flex gap-3 pb-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 h-12 text-base font-medium rounded-xl border-[#D8DCE5] text-[#1A1A1A] hover:bg-[#EDF0F5]"
            >
              Back
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1 h-12 text-base font-medium rounded-xl bg-[#1B3A5F] text-white hover:bg-[#2E6399] transition-colors"
            >
              Save and finish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
