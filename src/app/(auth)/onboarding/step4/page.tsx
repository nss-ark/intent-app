"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { ProgressBar } from "@/components/progress-bar";
import { SignalToggle } from "@/components/signal-toggle";
import { Button } from "@/components/ui/button";
import { signalTemplates } from "@/config/brand";

export default function OnboardingStep4() {
  const router = useRouter();
  const [signals, setSignals] = useState<Record<string, boolean>>({});

  // Initialize all signals from brand config
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
          <ProgressBar totalSteps={4} currentStep={4} />
          <p className="mt-3 text-xs text-[#6B6B66] font-medium tracking-wide">
            Step 4 of 4 &middot; Signals
          </p>

          {/* Heading */}
          <div className="mt-8">
            <h1 className="text-xl md:text-2xl font-heading font-semibold text-[#1A1A1A] tracking-tight">
              What are you open to?
            </h1>
            <p className="mt-2 text-sm text-[#6B6B66] leading-relaxed">
              Toggle the signals that match your current needs. Other members will
              see these on your profile card.
            </p>
          </div>

          {/* Your Asks */}
          <div className="mt-8">
            <div className="rounded-2xl bg-white border border-[#E8E4DA] shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 pt-5 pb-2">
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Your Asks
                </h2>
                <p className="text-xs text-[#6B6B66] mt-0.5">
                  What you&apos;re looking for from the community
                </p>
              </div>
              <div className="px-5 pb-3 divide-y divide-[#E8E4DA]/60">
                {asks.map((signal) => (
                  <SignalToggle
                    key={signal.code}
                    title={signal.displayName}
                    description={signal.description}
                    checked={signals[signal.code] ?? false}
                    onCheckedChange={(v) => toggleSignal(signal.code, v)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Your Offers */}
          <div className="mt-4">
            <div className="rounded-2xl bg-white border border-[#E8E4DA] shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 pt-5 pb-2">
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Your Offers
                </h2>
                <p className="text-xs text-[#6B6B66] mt-0.5">
                  What you&apos;re willing to help with
                </p>
              </div>
              <div className="px-5 pb-3 divide-y divide-[#E8E4DA]/60">
                {offers.map((signal) => (
                  <SignalToggle
                    key={signal.code}
                    title={signal.displayName}
                    description={signal.description}
                    checked={signals[signal.code] ?? false}
                    onCheckedChange={(v) => toggleSignal(signal.code, v)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mutuals */}
          <div className="mt-4">
            <div className="rounded-2xl bg-white border border-[#E8E4DA] shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 pt-5 pb-2">
                <h2 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">
                  Mutuals
                </h2>
                <p className="text-xs text-[#6B6B66] mt-0.5">
                  Peer-to-peer connections
                </p>
              </div>
              <div className="px-5 pb-3 divide-y divide-[#E8E4DA]/60">
                {mutuals.map((signal) => (
                  <SignalToggle
                    key={signal.code}
                    title={signal.displayName}
                    description={signal.description}
                    checked={signals[signal.code] ?? false}
                    onCheckedChange={(v) => toggleSignal(signal.code, v)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex gap-3 pb-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex-1 h-12 text-base font-medium rounded-xl border-[#E8E4DA] text-[#1A1A1A] hover:bg-[#F2EFE8]"
            >
              Back
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1 h-12 text-base font-medium rounded-xl bg-[#B8762A] text-white hover:bg-[#D4A053] transition-colors"
            >
              Save and finish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
