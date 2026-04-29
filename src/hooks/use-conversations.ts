import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./use-api";

interface ConversationUser {
  id: string;
  fullName: string;
  photoUrl: string | null;
  profile: { missionStatement: string | null } | null;
}

interface MessageItem {
  id: string;
  conversationId: string;
  senderUserId: string;
  body: string;
  sentAt: string;
  readAtByRecipient: string | null;
}

export interface ConversationItem {
  id: string;
  createdAt: string;
  lastMessageAt: string | null;
  matchId: string | null;
  originatedFromNudgeId: string | null;
  otherUser: ConversationUser;
  lastMessage: MessageItem | null;
  unreadCount: number;
}

interface ConversationsResponse {
  items: ConversationItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function useConversations(page = 1) {
  return useQuery<ConversationsResponse>({
    queryKey: ["conversations", page],
    queryFn: () => apiFetch(`/api/conversations?page=${page}`),
  });
}

interface PaginatedMessages {
  items: MessageItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ConversationDetail {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
  lastMessageAt: string | null;
  matchId: string | null;
  originatedFromNudgeId: string | null;
  otherUser: ConversationUser;
  messages: PaginatedMessages;
}

export function useConversation(id: string) {
  return useQuery<ConversationDetail>({
    queryKey: ["conversation", id],
    queryFn: () => apiFetch(`/api/conversations/${id}`),
    enabled: !!id,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) =>
      apiFetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["conversation", variables.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
