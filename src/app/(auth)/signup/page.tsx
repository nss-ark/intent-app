"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");

  const isValid = email.trim() !== "" && phone.trim() !== "" && fullName.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    // Store in localStorage for MVP persistence
    localStorage.setItem(
      "intent_signup",
      JSON.stringify({ email, phone: `+91${phone}`, fullName })
    );
    router.push("/signup/verify");
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

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                Phone number
              </Label>
              <div className="flex items-center gap-2">
                <div className="h-11 px-3 flex items-center rounded-xl border border-[#E8E4DA] bg-[#F2EFE8] text-sm text-[#6B6B66] font-medium shrink-0">
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
                  required
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

            {/* OTP caption */}
            <p className="text-xs text-[#6B6B66] leading-relaxed">
              We&apos;ll send a one-time code to verify your phone number.
            </p>

            {/* Continue */}
            <Button
              type="submit"
              disabled={!isValid}
              className="w-full h-12 text-base font-medium rounded-xl bg-[#B8762A] text-white hover:bg-[#D4A053] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </Button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-xs text-[#6B6B66] text-center leading-relaxed">
            By continuing, you agree to Intent&apos;s{" "}
            <Link href="#" className="text-[#B8762A] hover:underline font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-[#B8762A] hover:underline font-medium">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
