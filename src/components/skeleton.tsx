import { cn } from "@/lib/utils";

/** Shimmer skeleton placeholder */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#D8DCE5]/60",
        className
      )}
    />
  );
}

/** Card skeleton for discovery feed */
export function MemberCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
      <Skeleton className="h-[220px] rounded-none rounded-t-2xl" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-full" />
        <div className="h-px bg-[#D8DCE5]" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

/** Chat row skeleton */
export function ChatRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

/** Nudge row skeleton */
export function NudgeRowSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-52" />
      </div>
      <Skeleton className="h-3 w-14" />
    </div>
  );
}

/** Profile header skeleton */
export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-10 w-28 rounded-xl" />
    </div>
  );
}
