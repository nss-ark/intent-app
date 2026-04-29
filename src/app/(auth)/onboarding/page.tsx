"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/onboarding/step1");
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-[#1B3A5F] border-t-transparent animate-spin" />
    </div>
  );
}
