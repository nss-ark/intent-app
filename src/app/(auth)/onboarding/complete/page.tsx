"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  Clock,
  ShieldCheck,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { Button } from "@/components/ui/button";

const nextSteps = [
  {
    icon: ShieldCheck,
    title: "Profile review",
    description:
      "Our team will verify your ISB membership. This usually takes less than 24 hours.",
  },
  {
    icon: Clock,
    title: "Get notified",
    description:
      "We'll send you an email and push notification once your profile is approved.",
  },
  {
    icon: Users,
    title: "Start connecting",
    description:
      "Browse the community, send nudges, and find the people who share your Intent.",
  },
];

async function saveOnboardingData(): Promise<{
  firstName: string;
  error: string | null;
}> {
  let firstName = "there";
  try {
    // Read all onboarding step data from localStorage
    const step1 = JSON.parse(localStorage.getItem("intent_step1") || "{}");
    const step2 = JSON.parse(localStorage.getItem("intent_step2") || "{}");
    const step3 = JSON.parse(localStorage.getItem("intent_step3") || "{}");
    const step4 = JSON.parse(localStorage.getItem("intent_step4") || "{}");

    if (step1.fullName) {
      firstName = step1.fullName.split(" ")[0];
    }

    // Save profile data (step1 + step3 fields)
    const profilePayload: Record<string, unknown> = {
      isVisibleInDiscovery: true,
    };
    if (step1.fullName) profilePayload.fullName = step1.fullName;
    if (step3.intent) profilePayload.missionStatement = step3.intent;

    const profileRes = await fetch("/api/users/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profilePayload),
    });

    if (!profileRes.ok) {
      const profileJson = await profileRes.json();
      console.error("Profile save failed:", profileJson);
      return {
        firstName,
        error: "Failed to save profile. You can update it later from settings.",
      };
    }

    // Save step2 career data via experience API
    if (step2.currentCompany || step2.currentTitle) {
      try {
        // Save current experience
        await fetch("/api/users/me/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: step2.currentCompany || "",
            title: step2.currentTitle || "",
            isCurrent: true,
          }),
        });

        // Save past experiences
        const pastExps = (step2.pastExperiences ?? []).filter(
          (exp: { company: string; title: string }) => exp.company || exp.title
        );
        for (const exp of pastExps) {
          await fetch("/api/users/me/experience", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: exp.company || "",
              title: exp.title || "",
              isCurrent: false,
            }),
          });
        }
      } catch (err) {
        console.error("Experience save failed:", err);
        // Non-blocking — user can edit later
      }
    }

    // Save step2 niches if any selected
    if (step2.niches && Array.isArray(step2.niches) && step2.niches.length > 0) {
      try {
        // Fetch available niches to map codes to IDs
        const nichesRes = await fetch("/api/discovery/filters");
        if (nichesRes.ok) {
          const nichesJson = await nichesRes.json();
          const availableNiches: { id: string; code: string }[] = nichesJson?.niches ?? [];
          const nicheIds = step2.niches
            .map((code: string) => availableNiches.find((n) => n.code === code)?.id)
            .filter(Boolean) as string[];
          if (nicheIds.length > 0) {
            await fetch("/api/users/me/niches", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nicheIds }),
            });
          }
        }
      } catch (err) {
        console.error("Niches save failed:", err);
      }
    }

    // Save signals: resolve signal codes to tenant signal IDs
    if (Object.keys(step4).length > 0) {
      // Fetch tenant signals to get the code-to-ID mapping
      const signalsListRes = await fetch("/api/users/me/signals");
      if (signalsListRes.ok) {
        const signalsListJson = await signalsListRes.json();
        const tenantSignals: { id: string; code: string }[] =
          signalsListJson.data ?? [];

        // Map step4 codes to tenant signal IDs
        const signals = tenantSignals.map((ts) => ({
          tenantSignalId: ts.id,
          isOpen: step4[ts.code] === true,
        }));

        if (signals.length > 0) {
          const signalsRes = await fetch("/api/users/me/signals", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ signals }),
          });

          if (!signalsRes.ok) {
            const signalsJson = await signalsRes.json();
            console.error("Signals save failed:", signalsJson);
            // Non-blocking error
          }
        }
      }
    }

    // Clear localStorage onboarding data
    localStorage.removeItem("intent_step1");
    localStorage.removeItem("intent_step2");
    localStorage.removeItem("intent_step3");
    localStorage.removeItem("intent_step4");
    // Clear sessionStorage signup data
    sessionStorage.removeItem("intent_signup");

    return { firstName, error: null };
  } catch (err) {
    console.error("Onboarding save error:", err);
    return {
      firstName,
      error: "Something went wrong saving your profile. You can update it later.",
    };
  }
}

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("there");
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    saveOnboardingData().then(({ firstName, error: saveError }) => {
      setFullName(firstName);
      setError(saveError);
      setSaving(false);
    });
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-8 md:py-16">
      <div className="w-full max-w-[500px] flex flex-col items-center flex-1">
        {/* Wordmark */}
        <IntentWordmark size="md" />

        {/* Celebration icon */}
        <div className="mt-10 md:mt-14 w-20 h-20 rounded-full bg-[#E8EFF7] flex items-center justify-center">
          {saving ? (
            <Loader2 className="w-8 h-8 text-[#1B3A5F] animate-spin" />
          ) : (
            <Send className="w-8 h-8 text-[#1B3A5F]" />
          )}
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-2xl md:text-3xl font-heading font-semibold text-[#1A1A1A] tracking-tight text-center">
          {saving ? "Setting up your profile..." : "Welcome to Intent."}
        </h1>
        <p className="mt-2 text-base text-[#6B6B66] text-center leading-relaxed max-w-[380px]">
          {saving
            ? "Hang tight while we save your details."
            : `Your profile card is being reviewed, ${fullName}. We'll notify you once you're verified.`}
        </p>

        {error && (
          <div className="mt-4 w-full rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* What happens next */}
        {!saving && (
          <div className="mt-10 w-full">
            <h2 className="text-sm font-semibold text-[#6B6B66] uppercase tracking-wider text-center">
              What happens next
            </h2>
            <div className="mt-6 space-y-4">
              {nextSteps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl bg-white border border-[#D8DCE5] shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#E8EFF7] flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5 text-[#1B3A5F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#6B6B66] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTAs */}
      {!saving && (
        <div className="w-full max-w-[500px] mt-10 flex flex-col items-center gap-3">
          <Button
            onClick={() => router.push("/my-profile")}
            className="w-full h-12 text-base font-medium rounded-xl bg-[#1B3A5F] text-white hover:bg-[#2E6399] transition-colors"
          >
            Take me to my profile
          </Button>

          <Link
            href="/aligned/directory"
            className="flex items-center gap-1.5 text-sm font-medium text-[#6B6B66] hover:text-[#1A1A1A] transition-colors py-2"
          >
            Browse other ISB members
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
