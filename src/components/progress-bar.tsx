import { cn } from "@/lib/utils";

interface ProgressBarProps {
  totalSteps: number;
  currentStep: number;
  className?: string;
}

export function ProgressBar({ totalSteps, currentStep, className }: ProgressBarProps) {
  return (
    <div className={cn("flex gap-2 w-full", className)}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-300",
            i < currentStep ? "bg-[#1B3A5F]" : "bg-[#D8DCE5]"
          )}
        />
      ))}
    </div>
  );
}
