"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("superadmin-credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/superadmin");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-[320px] space-y-8">
        {/* Wordmark + SuperAdmin pill */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-heading text-2xl font-semibold tracking-tight text-[var(--intent-text-primary)]">
              intent
            </span>
            <span className="rounded-full border border-[var(--intent-green)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--intent-green)]">
              SuperAdmin
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-1 text-center">
          <h1 className="font-heading text-xl font-semibold text-[var(--intent-text-primary)]">
            Platform administration
          </h1>
          <p className="text-sm text-[var(--intent-text-secondary)]">
            Sign in to manage the Intent platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[var(--intent-text-primary)]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@intent.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-lg border-[var(--intent-text-tertiary)] bg-white text-sm"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[var(--intent-text-primary)]">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-lg border-[var(--intent-text-tertiary)] bg-white text-sm"
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-lg bg-[var(--intent-green)] text-sm font-medium text-white hover:bg-[var(--intent-green-light)] transition-colors disabled:opacity-40"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        {/* Caption */}
        <p className="text-center text-xs leading-relaxed text-[var(--intent-text-secondary)]">
          SuperAdmin access is restricted to authorized platform administrators.
          Contact your system administrator if you need access.
        </p>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--intent-text-secondary)]">
          <span>Intent Platform</span>
          <span>&middot;</span>
          <Link href="#" className="hover:text-[var(--intent-green)]">
            Privacy
          </Link>
          <span>&middot;</span>
          <Link href="#" className="hover:text-[var(--intent-green)]">
            Terms
          </Link>
          <span>&middot;</span>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
