"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Intent Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-[#1A1A1A]">
        Something went wrong
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[#6B6B66]">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-[#6B6B66]/60">
          Error ID: {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1B3A5F] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2E6399]"
      >
        <RefreshCw size={16} />
        Try again
      </button>
    </div>
  );
}
