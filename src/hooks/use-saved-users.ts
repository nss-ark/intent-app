import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./use-api";

export interface SavedUserItem {
  id: string;
  savedUser: {
    id: string;
    fullName: string;
    photoUrl: string | null;
    profile: {
      missionStatement: string | null;
      currentCity: string | null;
      currentCountry: string | null;
    } | null;
    experience: {
      title: string;
      freeTextCompanyName: string | null;
      company: { name: string } | null;
    }[];
  };
}

interface SavedUsersResponse {
  items: SavedUserItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function useSavedUsers() {
  return useQuery<SavedUsersResponse>({
    queryKey: ["saved-users"],
    queryFn: () => apiFetch("/api/saved-users"),
  });
}

export function useSaveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch("/api/saved-users", {
        method: "POST",
        body: JSON.stringify({ userId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-users"] });
    },
  });
}

export function useUnsaveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiFetch("/api/saved-users", {
        method: "DELETE",
        body: JSON.stringify({ userId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-users"] });
    },
  });
}
