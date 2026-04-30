"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  Send,
  ArrowRightLeft,
  BookOpen,
  Coffee,
  Rocket,
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
  "building-2": Building2,
  send: Send,
  "arrow-right-left": ArrowRightLeft,
  "book-open": BookOpen,
  coffee: Coffee,
  rocket: Rocket,
};

/* ------------------------------------------------------------------ */
/* Signal Card                                                         */
/* ------------------------------------------------------------------ */

function SignalCard({
  code,
  displayName,
  icon,
  checked,
  accentClass,
  onToggle,
  index,
}: {
  code: string;
  displayName: string;
  icon: string;
  checked: boolean;
  accentClass: string;
  onToggle: (code: string, value: boolean) => void;
  index: number;
}) {
  const Icon = iconMap[icon] ?? GraduationCap;

  return (
    <button
      type="button"
      onClick={() => onToggle(code, !checked)}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 p-4 text-center transition-all duration-200 ease-out select-none min-h-[120px]",
        checked
          ? `${accentClass} border-transparent shadow-lg scale-[1.02]`
          : "border-[#D8DCE5] bg-white hover:border-[#1B3A5F]/30 hover:shadow-md"
      )}
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: "both",
      }}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
          checked
            ? "bg-white/20"
            : "bg-[#E8EFF7]"
        )}
      >
        <Icon
          size={20}
          className={cn(
            "transition-colors duration-200",
            checked ? "text-white" : "text-[#1B3A5F]"
          )}
        />
      </div>
      <span
        className={cn(
          "text-[13px] font-medium leading-tight transition-colors duration-200",
          checked ? "text-white" : "text-[#1A1A1A]"
        )}
      >
        {displayName}
      </span>

      {/* Selection indicator */}
      {checked && (
        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/25">
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
      )}
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

          {/* ── What are you looking for? ──────────────────────────── */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-6 rounded-full bg-gradient-to-r from-[#1B3A5F] to-[#2E6399]" />
              <h2 className="text-sm font-semibold text-[#1A1A1A]">
                What are you looking for?
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {asks.map((signal, i) => (
                <SignalCard
                  key={signal.code}
                  code={signal.code}
                  displayName={signal.displayName.replace(/^Looking for |^Curious about |^Want to chat about /i, "").replace(/^a /i, "")}
                  icon={signal.icon}
                  checked={signals[signal.code] ?? false}
                  accentClass="bg-gradient-to-br from-[#1B3A5F] to-[#2E6399]"
                  onToggle={toggleSignal}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* ── How can you help? ──────────────────────────────────── */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-6 rounded-full bg-gradient-to-r from-[#2D4A3A] to-[#3D6B52]" />
              <h2 className="text-sm font-semibold text-[#1A1A1A]">
                How can you help?
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {offers.map((signal, i) => (
                <SignalCard
                  key={signal.code}
                  code={signal.code}
                  displayName={signal.displayName.replace(/^Open to /i, "").replace(/someone in my domain/, "in your domain")}
                  icon={signal.icon}
                  checked={signals[signal.code] ?? false}
                  accentClass="bg-gradient-to-br from-[#2D4A3A] to-[#3D6B52]"
                  onToggle={toggleSignal}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* ── Let's connect ──────────────────────────────────────── */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-6 rounded-full bg-gradient-to-r from-[#4A3A6B] to-[#7C5FA8]" />
              <h2 className="text-sm font-semibold text-[#1A1A1A]">
                Let&apos;s connect
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mutuals.map((signal, i) => (
                <SignalCard
                  key={signal.code}
                  code={signal.code}
                  displayName={signal.displayName.replace(/^Looking for |^Open to /i, "").replace(/^a /i, "").replace(/^an /i, "")}
                  icon={signal.icon}
                  checked={signals[signal.code] ?? false}
                  accentClass="bg-gradient-to-br from-[#4A3A6B] to-[#7C5FA8]"
                  onToggle={toggleSignal}
                  index={i}
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
