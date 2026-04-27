import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./use-api";

interface NudgeUser {
  id: string;
  fullName: string;
  photoUrl: string | null;
  profile: { missionStatement: string | null } | null;
}

interface NudgeSignal {
  tenantSignal: {
    id: string;
    template: { code: string; displayNameDefault: string; signalType: string; icon: string | null };
  };
}

export interface NudgeItem {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  message: string | null;
  status: string;
  sentAt: string;
  respondedAt: string | null;
  responseMessage: string | null;
  expiresAt: string | null;
  conversationId: string | null;
  sender: NudgeUser;
  receiver: NudgeUser;
  signals: NudgeSignal[];
}

interface NudgesResponse {
  items: NudgeItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function useReceivedNudges(page = 1) {
  return useQuery<NudgesResponse>({
    queryKey: ["nudges", "received", page],
    queryFn: () => apiFetch(`/api/nudges?tab=received&page=${page}`),
  });
}

export function useSentNudges(page = 1) {
  return useQuery<NudgesResponse>({
    queryKey: ["nudges", "sent", page],
    queryFn: () => apiFetch(`/api/nudges?tab=sent&page=${page}`),
  });
}

export function useNudgeDetail(id: string) {
  return useQuery<NudgeItem>({
    queryKey: ["nudge", id],
    queryFn: () => apiFetch(`/api/nudges/${id}`),
    enabled: !!id,
  });
}

export function useSendNudge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { receiverUserId: string; message: string; signalIds: string[] }) =>
      apiFetch("/api/nudges", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nudges"] });
      qc.invalidateQueries({ queryKey: ["nudge-quota"] });
    },
  });
}

export function useRespondNudge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) =>
      apiFetch(`/api/nudges/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nudges"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

interface NudgeQuota {
  sent: number;
  limit: number;
  remaining: number;
}

export function useNudgeQuota() {
  return useQuery<NudgeQuota>({
    queryKey: ["nudge-quota"],
    queryFn: () => apiFetch("/api/nudges/quota"),
  });
}
