"use client";

import { cn, getInitials } from "@/lib/utils";

/**
 * Deterministic gradient based on a name hash.
 * Returns a pair of CSS color strings.
 */
function getGradientColors(name: string): [string, string] {
  const gradients: [string, string][] = [
    ["#B8762A", "#D4A053"],
    ["#2D4A3A", "#3D6B52"],
    ["#8B5CF6", "#A78BFA"],
    ["#0EA5E9", "#38BDF8"],
    ["#6B6B66", "#9B9B94"],
    ["#D97706", "#F59E0B"],
    ["#DC2626", "#EF4444"],
    ["#059669", "#10B981"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

interface AvatarPlaceholderProps {
  name: string;
  gradientFrom?: string;
  gradientTo?: string;
  /** Size in px. Defaults to 40. */
  size?: number;
  className?: string;
  /** Text size class override */
  textClassName?: string;
}

export function AvatarPlaceholder({
  name,
  gradientFrom,
  gradientTo,
  size = 40,
  className,
  textClassName,
}: AvatarPlaceholderProps) {
  const [defaultFrom, defaultTo] = getGradientColors(name);
  const from = gradientFrom || defaultFrom;
  const to = gradientTo || defaultTo;
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-semibold text-white select-none",
        className
      )}
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        fontSize: size * 0.36,
      }}
      aria-label={name}
    >
      <span className={textClassName}>{initials}</span>
    </div>
  );
}

/**
 * Large hero placeholder for card photo areas and profile headers.
 * Renders a full-width gradient area with large centered initials.
 */
interface HeroPlaceholderProps {
  name: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
  /** Min height in px */
  minHeight?: number;
}

export function HeroPlaceholder({
  name,
  gradientFrom,
  gradientTo,
  className,
  minHeight = 280,
}: HeroPlaceholderProps) {
  const [defaultFrom, defaultTo] = getGradientColors(name);
  const from = gradientFrom || defaultFrom;
  const to = gradientTo || defaultTo;
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden",
        className
      )}
      style={{
        minHeight,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 60%, ${from}40 100%)`,
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-8 -right-8 rounded-full opacity-10"
        style={{
          width: minHeight * 0.6,
          height: minHeight * 0.6,
          background: "white",
        }}
      />
      <div
        className="absolute -bottom-6 -left-6 rounded-full opacity-10"
        style={{
          width: minHeight * 0.4,
          height: minHeight * 0.4,
          background: "white",
        }}
      />
      <span className="text-[4rem] font-bold text-white/90 select-none sm:text-[5rem]">
        {initials}
      </span>
    </div>
  );
}
