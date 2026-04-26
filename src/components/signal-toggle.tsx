"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface SignalToggleProps {
  title: string;
  description: string;
  icon?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function SignalToggle({
  title,
  description,
  checked,
  onCheckedChange,
  className,
}: SignalToggleProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 py-3",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1A1A1A] leading-snug">{title}</p>
        <p className="text-xs text-[#6B6B66] mt-0.5 leading-relaxed">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0 mt-0.5"
      />
    </div>
  );
}
