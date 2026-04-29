"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface ConsentRow {
  id: string;
  consentType: string;
  label: string;
  description: string;
  required: boolean;
  defaultChecked: boolean;
}

const consentRows: ConsentRow[] = [
  {
    id: "terms",
    consentType: "TERMS_OF_SERVICE",
    label: "Terms of Service",
    description:
      "I agree to Intent's Terms of Service governing use of the platform.",
    required: true,
    defaultChecked: true,
  },
  {
    id: "privacy",
    consentType: "PRIVACY_POLICY",
    label: "Privacy Policy",
    description:
      "I acknowledge Intent's Privacy Policy and how my data is handled.",
    required: true,
    defaultChecked: true,
  },
  {
    id: "visibility",
    consentType: "PROFILE_VISIBILITY",
    label: "Profile visibility",
    description:
      "Allow other verified ISB members to discover my profile in the community directory.",
    required: false,
    defaultChecked: false,
  },
];

export default function ConsentPage() {
  const router = useRouter();
  const [consents, setConsents] = useState<Record<string, boolean>>({
    terms: true,
    privacy: true,
    visibility: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = consents.terms && consents.privacy;

  const toggleConsent = (id: string, checked: boolean) => {
    setConsents((prev) => ({ ...prev, [id]: checked }));
  };

  const handleContinue = async () => {
    if (!canContinue) return;

    setLoading(true);
    setError(null);

    try {
      // Read signup credentials from sessionStorage
      const signupRaw = sessionStorage.getItem("intent_signup");
      if (!signupRaw) {
        setError("Signup session expired. Please start over.");
        setLoading(false);
        return;
      }

      const { email, password } = JSON.parse(signupRaw);

      // Auto-login first (consent API requires authentication)
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!loginResult?.ok) {
        setError(loginResult?.error ?? "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Record each checked consent
      const checkedConsents = consentRows.filter((row) => consents[row.id]);
      for (const row of checkedConsents) {
        const res = await fetch("/api/consents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consentType: row.consentType }),
        });

        if (!res.ok) {
          const json = await res.json();
          console.error("Consent recording failed:", json);
          // Non-blocking: continue even if a consent fails to record
        }
      }

      // Clear password from sessionStorage (keep email/fullName for onboarding)
      const signupData = JSON.parse(signupRaw);
      delete signupData.password;
      sessionStorage.setItem("intent_signup", JSON.stringify(signupData));

      router.push("/onboarding/step1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-6 md:py-12">
      {/* Header */}
      <div className="w-full max-w-[440px] mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#6B6B66] hover:text-[#1A1A1A] transition-colors -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center flex-1 mt-6 md:mt-10">
        <IntentWordmark size="md" />

        <div className="w-full max-w-[440px] mt-8 md:mt-10">
          <h1 className="text-xl md:text-2xl font-heading font-semibold text-[#1A1A1A] tracking-tight">
            Before we start
          </h1>
          <p className="mt-2 text-sm text-[#6B6B66]">
            Please review and confirm the following to continue.
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Consent rows */}
          <div className="mt-8 space-y-1">
            {consentRows.map((row) => (
              <label
                key={row.id}
                className="flex items-start gap-3.5 rounded-xl p-4 cursor-pointer hover:bg-[#E8EFF7]/30 transition-colors"
              >
                <Checkbox
                  checked={consents[row.id]}
                  onCheckedChange={(checked) =>
                    toggleConsent(row.id, checked as boolean)
                  }
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#1A1A1A]">
                      {row.label}
                    </span>
                    {row.required && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[#1B3A5F]">
                        Required
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#6B6B66] leading-relaxed">
                    {row.description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Info notice */}
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#E8EFF7]/50 border border-[#D8DCE5] p-4">
            <Info className="w-4 h-4 text-[#1B3A5F] shrink-0 mt-0.5" />
            <p className="text-xs text-[#6B6B66] leading-relaxed">
              You can withdraw your consent at any time from your profile
              settings. Withdrawing consent for required items will deactivate
              your account.
            </p>
          </div>

          {/* Continue */}
          <Button
            onClick={handleContinue}
            disabled={!canContinue || loading}
            className="w-full h-12 text-base font-medium rounded-xl bg-[#1B3A5F] text-white hover:bg-[#2E6399] transition-colors mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
