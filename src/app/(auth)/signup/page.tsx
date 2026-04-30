"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

  const isValid =
    email.trim() !== "" &&
    fullName.trim() !== "" &&
    password.length >= 8 &&
    tosAccepted &&
    privacyAccepted;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName,
          ...(phone.trim() ? { phoneNumber: `+91${phone}` } : {}),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Something went wrong. Please try again.");
        return;
      }

      // Store credentials and consent in sessionStorage for auto-login after OTP
      sessionStorage.setItem(
        "intent_signup",
        JSON.stringify({
          email,
          password,
          fullName,
          ...(phone.trim() ? { phone: `+91${phone}` } : {}),
          consents: { tosAccepted, privacyAccepted, profileVisible },
        })
      );

      router.push("/signup/verify");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-6 md:py-12">
      {/* Header */}
      <div className="w-full max-w-[440px] mx-auto">
        <button
          onClick={() => router.push("/")}
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
            Create your account
          </h1>
          <p className="mt-2 text-sm text-[#6B6B66]">
            We&apos;ll verify your ISB membership to get you in.
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Social Sign-up */}
          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-[#D8DCE5] bg-white text-sm font-medium text-[#1A1A1A] hover:bg-[#F7F8FB] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#D8DCE5]" />
            <span className="text-xs text-[#6B6B66] font-medium">or sign up with email</span>
            <div className="flex-1 h-px bg-[#D8DCE5]" />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#1A1A1A]">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@isb.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl bg-white text-base"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-[#1A1A1A]">
                Phone number <span className="text-[#6B6B66] font-normal">(optional)</span>
              </Label>
              <div className="flex items-center gap-2">
                <div className="h-11 px-3 flex items-center rounded-xl border border-[#D8DCE5] bg-[#EDF0F5] text-sm text-[#6B6B66] font-medium shrink-0">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="h-11 rounded-xl bg-white text-base flex-1"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-[#1A1A1A]">
                Full name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="As per your ISB records"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl bg-white text-base"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[#1A1A1A]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl bg-white text-base"
                minLength={8}
                required
              />
            </div>

            {/* OTP caption */}
            <p className="text-xs text-[#6B6B66] leading-relaxed">
              We&apos;ll send a verification code to your email address.
            </p>

            {/* Consent */}
            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={tosAccepted}
                  onCheckedChange={(c) => setTosAccepted(c as boolean)}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-xs text-[#6B6B66] leading-relaxed">
                  I agree to Intent&apos;s{" "}
                  <Link href="/terms" target="_blank" className="text-[#1B3A5F] hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" target="_blank" className="text-[#1B3A5F] hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  . <span className="text-[10px] font-medium uppercase tracking-wider text-[#1B3A5F]">Required</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={profileVisible}
                  onCheckedChange={(c) => setProfileVisible(c as boolean)}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-xs text-[#6B6B66] leading-relaxed">
                  Allow other verified ISB members to discover my profile in the community directory.
                </span>
              </label>

              <p className="text-[11px] text-[#6B6B66] leading-relaxed pl-7">
                You can change these preferences anytime from Settings.
              </p>
            </div>

            {/* Continue */}
            <Button
              type="submit"
              disabled={!isValid || loading}
              className="w-full h-12 text-base font-medium rounded-xl bg-[#1B3A5F] text-white hover:bg-[#2E6399] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
