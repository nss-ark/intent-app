"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function OtpInput({ length = 6, value, onChange, className }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const focusInput = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, length - 1));
    inputRefs.current[clampedIndex]?.focus();
  }, [length]);

  const handleChange = useCallback(
    (index: number, char: string) => {
      // Only accept digits
      if (char && !/^\d$/.test(char)) return;

      const newValue = value.split("");
      newValue[index] = char;
      const joined = newValue.join("").slice(0, length);
      onChange(joined);

      if (char && index < length - 1) {
        focusInput(index + 1);
      }
    },
    [value, length, onChange, focusInput]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        if (digits[index]) {
          handleChange(index, "");
        } else if (index > 0) {
          handleChange(index - 1, "");
          focusInput(index - 1);
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        focusInput(index - 1);
      } else if (e.key === "ArrowRight" && index < length - 1) {
        e.preventDefault();
        focusInput(index + 1);
      }
    },
    [digits, handleChange, focusInput, length]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (pastedData) {
        onChange(pastedData);
        focusInput(Math.min(pastedData.length, length - 1));
      }
    },
    [length, onChange, focusInput]
  );

  return (
    <div className={cn("flex gap-3 justify-center", className)}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(i)}
          className={cn(
            "w-11 h-14 md:w-12 md:h-14 text-center text-xl font-semibold rounded-xl border-2 bg-white transition-all duration-150 outline-none",
            focusedIndex === i && !digits[i]
              ? "border-[#1B3A5F] ring-3 ring-[#1B3A5F]/20"
              : digits[i]
              ? "border-[#1B3A5F] bg-[#E8EFF7]/50"
              : "border-[#D8DCE5]"
          )}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}
