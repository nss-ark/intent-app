"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NichePillsProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  className?: string;
  allowCreate?: boolean;
  onCreateOption?: (label: string) => void;
}

export function NichePills({
  options,
  selected,
  onChange,
  max = 5,
  className,
  allowCreate = false,
  onCreateOption,
}: NichePillsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else if (selected.length < max) {
      onChange([...selected, value]);
    }
  };

  const handleCreate = () => {
    const trimmed = newLabel.trim();
    if (!trimmed || selected.length >= max) return;

    const value = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    if (options.some((o) => o.value === value)) {
      // Already exists — just select it
      if (!selected.includes(value)) {
        onChange([...selected, value]);
      }
    } else {
      onCreateOption?.(trimmed);
      onChange([...selected, value]);
    }

    setNewLabel("");
    setIsCreating(false);
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
                ? "bg-[#1B3A5F] text-white border-[#1B3A5F]"
                : "bg-white text-[#1A1A1A] border-[#D8DCE5] hover:border-[#1B3A5F]/50 hover:bg-[#E8EFF7]/50",
              isDisabled && "opacity-40 cursor-not-allowed hover:bg-white hover:border-[#D8DCE5]"
            )}
          >
            {option.label}
          </button>
        );
      })}

      {allowCreate && selected.length < max && (
        isCreating ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value.slice(0, 30))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") { setIsCreating(false); setNewLabel(""); }
              }}
              placeholder="Type interest..."
              className="h-8 w-32 rounded-full border border-[#1B3A5F] bg-white px-3 text-sm text-[#1A1A1A] outline-none focus:ring-2 focus:ring-[#1B3A5F]/20"
              autoFocus
              maxLength={30}
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newLabel.trim()}
              className="flex h-8 items-center justify-center rounded-full bg-[#1B3A5F] px-3 text-sm font-medium text-white disabled:opacity-40"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setNewLabel(""); }}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#EDF0F5]"
            >
              <X className="w-3.5 h-3.5 text-[#6B6B66]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border border-dashed border-[#1B3A5F]/50 text-[#1B3A5F] hover:bg-[#E8EFF7]/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create
          </button>
        )
      )}
    </div>
  );
}
