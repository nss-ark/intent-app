/**
 * Intent brand constants.
 *
 * Single source of truth for colors, spacing, typography, and
 * signal templates (Asks, Offers, Mutuals). Import from here
 * instead of hard-coding hex values or magic strings.
 */

// ── Colors ──────────────────────────────────────────────────────────────

export const colors = {
  background: "#FAFAF6",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B66",
  textTertiary: "#E8E4DA",
  amber: "#B8762A",
  amberLight: "#D4A053",
  amberSubtle: "#F5EDE0",
  green: "#2D4A3A",
  greenLight: "#3D6B52",
  greenSubtle: "#E4EDE8",
  destructive: "#D94141",
  muted: "#F2EFE8",
} as const;

// ── Typography ──────────────────────────────────────────────────────────

export const typography = {
  fontBody: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  fontHeading:
    "'Inter Tight', 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
  fontMono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
  /** Font feature settings for Inter's stylistic alternates */
  fontFeatures: '"cv02", "cv03", "cv04", "cv11"',
} as const;

// ── Spacing (8pt grid) ─────────────────────────────────────────────────

export const spacing = {
  1: "0.25rem", //  4px
  2: "0.5rem", //  8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
} as const;

// ── Layout ──────────────────────────────────────────────────────────────

export const layout = {
  mobileBaseline: 390,
  maxContentWidth: 1200,
  narrowContentWidth: 640,
  cardRadius: 16,
  cardShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
  cardShadowHover: "0 8px 24px rgba(0, 0, 0, 0.08)",
  iconStroke: 1.5,
} as const;

// ── Breakpoints ─────────────────────────────────────────────────────────

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// ── Signal types ────────────────────────────────────────────────────────

export type SignalType = "ask" | "offer" | "mutual";

export interface SignalTemplate {
  code: string;
  displayName: string;
  description: string;
  type: SignalType;
  /** Code of the paired ask/offer twin. Null for mutuals. */
  pairedCode: string | null;
  icon: string;
  defaultActive: boolean;
}

/**
 * Initial set of signal templates from the master plan.
 * Per-tenant configurable; admins can deactivate signals that do not fit.
 */
export const signalTemplates: SignalTemplate[] = [
  // ── Ask / Offer pairs ──
  {
    code: "seek_mentor",
    displayName: "Looking for a mentor in this domain",
    description:
      "You are seeking a mentor who can guide you in your area of interest.",
    type: "ask",
    pairedCode: "offer_mentor",
    icon: "graduation-cap",
    defaultActive: true,
  },
  {
    code: "offer_mentor",
    displayName: "Open to mentoring someone in my domain",
    description:
      "You are willing to mentor someone in your area of expertise.",
    type: "offer",
    pairedCode: "seek_mentor",
    icon: "graduation-cap",
    defaultActive: true,
  },
  {
    code: "curious_company",
    displayName: "Curious about working at your company",
    description:
      "You want to learn about someone's experience at their company.",
    type: "ask",
    pairedCode: "discuss_company",
    icon: "building-2",
    defaultActive: true,
  },
  {
    code: "discuss_company",
    displayName: "Open to discussing my company",
    description:
      "You are happy to share what it is like working at your company.",
    type: "offer",
    pairedCode: "curious_company",
    icon: "building-2",
    defaultActive: true,
  },
  {
    code: "seek_referral",
    displayName: "Looking for an interview referral",
    description: "You are seeking a referral for an open position.",
    type: "ask",
    pairedCode: "offer_referral",
    icon: "send",
    defaultActive: true,
  },
  {
    code: "offer_referral",
    displayName: "Open to giving referrals",
    description: "You are willing to refer qualified candidates at your company.",
    type: "offer",
    pairedCode: "seek_referral",
    icon: "send",
    defaultActive: true,
  },
  {
    code: "career_switch_ask",
    displayName: "Want to chat about a career switch",
    description:
      "You are considering changing domains and want guidance from someone who has done it.",
    type: "ask",
    pairedCode: "career_switch_offer",
    icon: "arrow-right-left",
    defaultActive: true,
  },
  {
    code: "career_switch_offer",
    displayName: "Open to discussing career switches into my domain",
    description:
      "You have switched careers and are willing to help others navigate the same path.",
    type: "offer",
    pairedCode: "career_switch_ask",
    icon: "arrow-right-left",
    defaultActive: true,
  },

  // ── Mutuals ──
  {
    code: "case_prep_partner",
    displayName: "Looking for a case prep partner",
    description: "You want to practice case interviews with a peer.",
    type: "mutual",
    pairedCode: null,
    icon: "book-open",
    defaultActive: true,
  },
  {
    code: "coffee_chat",
    displayName: "Open to an informal coffee chat",
    description: "You are open to a casual conversation with a fellow member.",
    type: "mutual",
    pairedCode: null,
    icon: "coffee",
    defaultActive: true,
  },
  {
    code: "cofounder_search",
    displayName: "Looking for a co-founder",
    description: "You are searching for a co-founder for a venture.",
    type: "mutual",
    pairedCode: null,
    icon: "rocket",
    defaultActive: true,
  },
] as const;

// ── Badge categories ────────────────────────────────────────────────────

export type BadgeCategory = "identity" | "achievement" | "special";

export const badgeCategories: Record<
  BadgeCategory,
  { label: string; description: string }
> = {
  identity: {
    label: "Identity",
    description: "Awarded by membership status (e.g., Current Student, Alumni).",
  },
  achievement: {
    label: "Achievement",
    description:
      "Awarded on verification or accumulation (e.g., Founder, Mentor of the Month).",
  },
  special: {
    label: "Special",
    description: "Custom badges created by tenant admins.",
  },
} as const;

// ── Nudge defaults ──────────────────────────────────────────────────────

export const nudgeDefaults = {
  maxCharacters: 400,
  softWarningAt: 200,
  weeklyQuota: 5,
  declineCooldownDays: 90,
  ignoreCooldownDays: 30,
  expiryDays: 14,
} as const;

// ── Gamification level defaults ─────────────────────────────────────────

export const gamificationLevels = [
  { level: 1, label: "Newcomer", minPoints: 0 },
  { level: 2, label: "Contributor", minPoints: 100 },
  { level: 3, label: "Connector", minPoints: 500 },
  { level: 4, label: "Pillar", minPoints: 2000 },
] as const;

// ── Member status ───────────────────────────────────────────────────────

export const memberStatuses = [
  "current_student",
  "recent_grad",
  "alumni",
] as const;

export type MemberStatus = (typeof memberStatuses)[number];

// ── Admin roles ─────────────────────────────────────────────────────────

export const adminRoles = ["owner", "operator", "moderator"] as const;
export type AdminRole = (typeof adminRoles)[number];

export const adminRoleDescriptions: Record<AdminRole, string> = {
  owner:
    "Holds billing, contract authority, and existential decisions about the tenant.",
  operator:
    "Runs day-to-day work: member onboarding, badge management, event creation, survey publishing, analytics.",
  moderator:
    "Handles the verification queue, abuse reports, and user suspensions.",
} as const;
