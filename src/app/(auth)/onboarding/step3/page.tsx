"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { ProgressBar } from "@/components/progress-bar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_CHARS = 200;

const exampleIntents = [
  "Looking to transition from consulting to building my own D2C brand in the health & wellness space.",
  "Exploring the VC ecosystem in India and seeking to connect with founders building in climate-tech.",
  "Want to mentor early-career professionals pivoting into product management from engineering roles.",
];

export default function OnboardingStep3() {
  const router = useRouter();
  const [intent, setIntent] = useState("");

  useEffect(() => {
    try {
      const step3 = JSON.parse(localStorage.getItem("intent_step3") || "{}");
      if (step3.intent) setIntent(step3.intent);
    } catch {
      // ignore
    }
  }, []);

  const charCount = intent.length;
  const isValid = intent.trim().length >= 10;

  const handleContinue = () => {
    if (!isValid) return;
    localStorage.setItem("intent_step3", JSON.stringify({ intent }));
    router.push("/onboarding/step4");
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-6 md:py-12">
      {/* Header */}
      <div className="w-full max-w-[560px] mx-auto">
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

        <div className="w-full max-w-[560px] mt-6 md:mt-8">
          {/* Progress */}
          <ProgressBar totalSteps={4} currentStep={3} />
          <p className="mt-3 text-xs text-[#6B6B66] font-medium tracking-wide">
            Step 3 of 4 &middot; Your Intent
          </p>

          {/* THE headline - large editorial feel */}
          <div className="mt-10 md:mt-12">
            <h1 className="text-3xl md:text-4xl font-heading font-semibold text-[#1A1A1A] tracking-tight leading-tight text-balance">
              What&apos;s your
              <br />
              <span className="text-[#1B3A5F]">Intent</span>?
            </h1>
            <p className="mt-3 text-base text-[#6B6B66] leading-relaxed max-w-[420px]">
              In one or two sentences, tell the community what you&apos;re working on,
              exploring, or seeking. This is the first thing people see on your card.
            </p>
          </div>

          {/* Textarea */}
          <div className="mt-8 relative">
            <Textarea
              value={intent}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) {
                  setIntent(e.target.value);
                }
              }}
              placeholder="e.g. Looking to transition from consulting to building my own D2C brand..."
              className="min-h-[140px] md:min-h-[160px] rounded-2xl bg-white text-base leading-relaxed p-4 resize-none border-[#D8DCE5] focus-visible:border-[#1B3A5F] focus-visible:ring-[#1B3A5F]/20"
              maxLength={MAX_CHARS}
            />
            {/* Character counter */}
            <div className="absolute bottom-3 right-3">
              <span
                className={`text-xs tabular-nums font-medium ${
                  charCount >= MAX_CHARS
                    ? "text-red-500"
                    : charCount >= MAX_CHARS * 0.8
                    ? "text-[#1B3A5F]"
                    : "text-[#6B6B66]/50"
                }`}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Example card */}
          <div className="mt-6 rounded-2xl bg-[#E8EFF7]/50 border border-[#D8DCE5] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#1B3A5F]" />
              <span className="text-xs font-semibold text-[#1B3A5F] uppercase tracking-wider">
                Examples
              </span>
            </div>
            <div className="space-y-3">
              {exampleIntents.map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIntent(example.slice(0, MAX_CHARS))}
                  className="block w-full text-left text-sm text-[#6B6B66] leading-relaxed hover:text-[#1A1A1A] transition-colors cursor-pointer"
                >
                  &ldquo;{example}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 h-12 text-base font-medium rounded-xl border-[#D8DCE5] text-[#1A1A1A] hover:bg-[#EDF0F5]"
            >
              Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!isValid}
              className="flex-1 h-12 text-base font-medium rounded-xl bg-[#1B3A5F] text-white hover:bg-[#2E6399] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
