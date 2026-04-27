import {
  GraduationCap,
  Building2,
  Send,
  ArrowRightLeft,
  BookOpen,
  Coffee,
  Rocket,
  Zap,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  "graduation-cap": GraduationCap,
  "building-2": Building2,
  send: Send,
  "arrow-right-left": ArrowRightLeft,
  "book-open": BookOpen,
  coffee: Coffee,
  rocket: Rocket,
};

interface SignalIconProps extends LucideProps {
  name: string;
}

export function SignalIcon({ name, ...props }: SignalIconProps) {
  const Icon = ICON_MAP[name] ?? Zap;
  return <Icon {...props} />;
}
