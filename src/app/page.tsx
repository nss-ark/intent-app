"use client";

import Link from "next/link";
import { IntentWordmark } from "@/components/intent-wordmark";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F7F8FB] safe-top safe-bottom">
      <div className="flex flex-1 flex-col items-center justify-between px-6 py-8 md:py-16">
        {/* Top section */}
        <div className="w-full max-w-[500px] flex flex-col items-center flex-1">
          {/* Wordmark */}
          <div className="mt-4 md:mt-8">
            <IntentWordmark size="lg" />
          </div>

          {/* Hero gradient placeholder */}
          <div className="w-full mt-8 md:mt-12 rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[16/10] max-w-[500px]">
            <div
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(135deg, #E8EFF7 0%, #B8CCE0 25%, #2E6399 50%, #1B3A5F 75%, #2D4A3A 100%)",
              }}
            />
          </div>

          {/* Heading & subtext */}
          <div className="mt-8 md:mt-10 text-center max-w-[420px]">
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-[#1A1A1A] tracking-tight text-balance">
              What&apos;s your Intent?
            </h1>
            <p className="mt-3 text-base md:text-lg text-[#6B6B66] leading-relaxed text-balance">
              Connect with the people in your ISB community whose work and direction align with yours.
            </p>
          </div>
        </div>

        {/* Bottom CTA section */}
        <div className="w-full max-w-[500px] mt-8 md:mt-12 flex flex-col items-center gap-3">
          <Link href="/signup" className="w-full">
            <Button
              className="w-full h-12 text-base font-medium rounded-xl bg-[#1B3A5F] text-white hover:bg-[#2E6399] transition-colors"
            >
              Create your account
            </Button>
          </Link>

          <Link
            href="/login"
            className="text-sm font-medium text-[#6B6B66] hover:text-[#1A1A1A] transition-colors py-2"
          >
            I already have an account
          </Link>

          <p className="mt-4 text-xs text-[#6B6B66]/60 tracking-wide">
            An ISB community.
          </p>
        </div>
      </div>
    </div>
  );
}
