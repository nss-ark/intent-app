import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./use-api";

export interface DiscoveryMember {
  id: string;
  fullName: string;
  photoUrl: string | null;
  missionStatement: string;
  institutionMemberStatus: string;
  yearsOfExperience: number | null;
  currentCity: string | null;
  currentCountry: string | null;
  domain: { id: string; displayName: string } | null;
  niches: { id: string; displayName: string }[];
  currentCompany: string | null;
  companyLogoUrl: string | null;
  openSignals: { id: string; displayName: string; signalType: string; icon: string }[];
  badges: { id: string; tenantBadgeId: string; displayName: string; isVisible: boolean }[];
  isVerified: boolean;
  graduationYear?: number | null;
}

interface DiscoveryResponse {
  members: DiscoveryMember[];
  total: number;
  page: number;
  pageSize: number;
}

interface DiscoveryFilters {
  search?: string;
  domain?: string;
  niche?: string;
  city?: string;
  classYear?: string;
  page?: number;
  pageSize?: number;
}

export function useDiscovery(filters: DiscoveryFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.domain) params.set("domain", filters.domain);
  if (filters.niche) params.set("niche", filters.niche);
  if (filters.city) params.set("city", filters.city);
  if (filters.classYear) params.set("classYear", filters.classYear);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const qs = params.toString();
  const url = `/api/discovery${qs ? `?${qs}` : ""}`;

  return useQuery<DiscoveryResponse>({
    queryKey: ["discovery", filters],
    queryFn: () => apiFetch(url),
  });
}

interface FilterOptions {
  domains: { id: string; code: string; displayName: string }[];
  niches: { id: string; code: string; displayName: string }[];
  cities: string[];
  classYears: number[];
}

export function useDiscoveryFilters() {
  return useQuery<FilterOptions>({
    queryKey: ["discovery-filters"],
    queryFn: () => apiFetch("/api/discovery/filters"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
