"use client";

import { cn } from "@/lib/utils";

interface NichePillsProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  className?: string;
}

export function NichePills({
  options,
  selected,
  onChange,
  max = 3,
  className,
}: NichePillsProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else if (selected.length < max) {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const isDisabled = !isSelected && selected.length >= max;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleToggle(option.value)}
            disabled={isDisabled}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border select-none",
              isSelected
                ? "bg-[#B8762A] text-white border-[#B8762A]"
                : "bg-white text-[#1A1A1A] border-[#E8E4DA] hover:border-[#B8762A]/50 hover:bg-[#F5EDE0]/50",
              isDisabled && "opacity-40 cursor-not-allowed hover:bg-white hover:border-[#E8E4DA]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
