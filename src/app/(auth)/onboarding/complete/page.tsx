"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Send, Clock, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { Button } from "@/components/ui/button";

const steps = [
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

export default function OnboardingCompletePage() {
  const [fullName, setFullName] = useState("there");

  useEffect(() => {
    try {
      const step1 = JSON.parse(localStorage.getItem("intent_step1") || "{}");
      if (step1.fullName) {
        setFullName(step1.fullName.split(" ")[0]);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-8 md:py-16">
      <div className="w-full max-w-[500px] flex flex-col items-center flex-1">
        {/* Wordmark */}
        <IntentWordmark size="md" />

        {/* Celebration icon */}
        <div className="mt-10 md:mt-14 w-20 h-20 rounded-full bg-[#F5EDE0] flex items-center justify-center">
          <Send className="w-8 h-8 text-[#B8762A]" />
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-2xl md:text-3xl font-heading font-semibold text-[#1A1A1A] tracking-tight text-center">
          Welcome to Intent.
        </h1>
        <p className="mt-2 text-base text-[#6B6B66] text-center leading-relaxed max-w-[380px]">
          Your profile card is being reviewed, {fullName}. We&apos;ll notify
          you once you&apos;re verified.
        </p>

        {/* What happens next */}
        <div className="mt-10 w-full">
          <h2 className="text-sm font-semibold text-[#6B6B66] uppercase tracking-wider text-center">
            What happens next
          </h2>
          <div className="mt-6 space-y-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl bg-white border border-[#E8E4DA] shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F5EDE0] flex items-center justify-center shrink-0">
                  <step.icon className="w-5 h-5 text-[#B8762A]" />
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
      </div>

      {/* Bottom CTAs */}
      <div className="w-full max-w-[500px] mt-10 flex flex-col items-center gap-3">
        <Link href="/home" className="w-full">
          <Button className="w-full h-12 text-base font-medium rounded-xl bg-[#B8762A] text-white hover:bg-[#D4A053] transition-colors">
            Take me to my profile
          </Button>
        </Link>

        <Link
          href="/home"
          className="flex items-center gap-1.5 text-sm font-medium text-[#6B6B66] hover:text-[#1A1A1A] transition-colors py-2"
        >
          Browse other ISB members
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
