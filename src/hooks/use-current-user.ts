import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./use-api";

interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  photoUrl: string | null;
  phoneNumber: string | null;
  institutionMemberStatus: string | null;
  graduationYear: number | null;
  program: string | null;
  tenantId: string;
  profile: {
    missionStatement: string | null;
    currentCity: string | null;
    currentCountry: string | null;
    yearsOfExperienceCached: number | null;
    profileCompletenessScore: number;
    isVisibleInDiscovery: boolean;
    acceptingNewConversations: boolean;
    weeklyInboxLimit: number;
    domain: { id: string; displayName: string } | null;
  } | null;
  niches: { niche: { id: string; displayName: string }; position: number }[];
  education: { id: string; programName: string; batchYear: number | null; specialization: string | null }[];
  experience: {
    id: string;
    title: string;
    isCurrent: boolean;
    company: { id: string; name: string; logoUrl: string | null } | null;
    freeTextCompanyName: string | null;
  }[];
  badges: {
    id: string;
    tenantBadge: { id: string; template: { code: string; displayNameDefault: string; category: string } };
  }[];
  openSignals: {
    tenantSignal: { id: string; template: { code: string; displayNameDefault: string; signalType: string; icon: string | null } };
    isOpen: boolean;
  }[];
  gamificationState: {
    totalPoints: number;
    currentLevel: number;
    currentStreakWeeks: number;
    nudgesSentLifetime: number;
    nudgesAcceptedLifetime: number;
  } | null;
}

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/users/me"),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
