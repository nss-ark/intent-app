"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Redirects /saved to the Saved tab inside the inbox */
export default function SavedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inbox?tab=saved");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#B8762A]" />
    </div>
  );
}
