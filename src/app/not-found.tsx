import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-[#E8E4DA]">404</h1>
      <h2 className="mt-4 text-lg font-semibold text-[#1A1A1A]">
        Page not found
      </h2>
      <p className="mt-2 max-w-sm text-sm text-[#6B6B66]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/home"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#B8762A] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#D4A053]"
      >
        <Home size={16} />
        Go to discovery
      </Link>
    </div>
  );
}
