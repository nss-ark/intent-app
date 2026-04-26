import { cn } from "@/lib/utils";

interface IntentWordmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

export function IntentWordmark({ size = "md", className }: IntentWordmarkProps) {
  return (
    <span
      className={cn(
        "font-sans font-semibold tracking-tight text-[#1A1A1A] select-none",
        sizeClasses[size],
        className
      )}
    >
      intent
    </span>
  );
}
