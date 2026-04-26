"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IntentWordmark } from "@/components/intent-wordmark";
import { OtpInput } from "@/components/otp-input";
import { Button } from "@/components/ui/button";

const RESEND_COOLDOWN = 30; // seconds

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("intent_signup") || "{}");
      setPhone(data.phone || "+91 98765 43210");
    } catch {
      setPhone("+91 98765 43210");
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = useCallback(() => {
    if (countdown > 0) return;
    setCountdown(RESEND_COOLDOWN);
    setOtp("");
  }, [countdown]);

  const handleVerify = () => {
    // MVP: any 6-digit code works
    if (otp.length === 6) {
      router.push("/signup/consent");
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

        <div className="w-full max-w-[440px] mt-8 md:mt-10 text-center">
          <h1 className="text-xl md:text-2xl font-heading font-semibold text-[#1A1A1A] tracking-tight">
            Verify your phone
          </h1>
          <p className="mt-2 text-sm text-[#6B6B66]">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-[#1A1A1A]">{phone}</span>
          </p>

          {/* OTP Input */}
          <div className="mt-8">
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          {/* Resend / Timer */}
          <div className="mt-6 flex flex-col items-center gap-2">
            {countdown > 0 ? (
              <p className="text-sm text-[#6B6B66]">
                Resend code in{" "}
                <span className="font-medium text-[#1A1A1A] tabular-nums">
                  0:{countdown.toString().padStart(2, "0")}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm font-medium text-[#B8762A] hover:underline"
              >
                Resend code
              </button>
            )}

            <button
              onClick={() => router.push("/signup")}
              className="text-sm text-[#6B6B66] hover:text-[#1A1A1A] transition-colors"
            >
              Change number
            </button>
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6}
            className="w-full h-12 text-base font-medium rounded-xl bg-[#B8762A] text-white hover:bg-[#D4A053] transition-colors mt-8 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Verify and continue
          </Button>
        </div>
      </div>
    </div>
  );
}
