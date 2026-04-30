"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Handshake,
  Users,
  ClipboardList,
  CalendarClock,
  Zap,
  Loader2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/use-api";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  readAt: string | null;
  createdAt: string;
}

interface NotificationsResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
}

/* ------------------------------------------------------------------ */
/* Icon by notification type                                            */
/* ------------------------------------------------------------------ */

function NotificationIcon({ type }: { type: string }) {
  const base = "flex-shrink-0 rounded-full p-2";

  switch (type) {
    case "MATCH_CREATED":
      return (
        <div className={`${base} bg-[var(--intent-navy-subtle)]`}>
          <Handshake size={18} strokeWidth={1.5} className="text-[var(--intent-navy)]" />
        </div>
      );
    case "GROUP_MATCH_CREATED":
      return (
        <div className={`${base} bg-[var(--intent-navy-subtle)]`}>
          <Users size={18} strokeWidth={1.5} className="text-[var(--intent-navy)]" />
        </div>
      );
    case "SURVEY_AVAILABLE":
      return (
        <div className={`${base} bg-blue-50`}>
          <ClipboardList size={18} strokeWidth={1.5} className="text-blue-500" />
        </div>
      );
    case "EVENT_REMINDER":
      return (
        <div className={`${base} bg-green-50`}>
          <CalendarClock size={18} strokeWidth={1.5} className="text-green-600" />
        </div>
      );
    case "NUDGE_RECEIVED":
      return (
        <div className={`${base} bg-purple-50`}>
          <Zap size={18} strokeWidth={1.5} className="text-purple-500" />
        </div>
      );
    default:
      return (
        <div className={`${base} bg-[var(--intent-navy-subtle)]`}>
          <Bell size={18} strokeWidth={1.5} className="text-[var(--intent-navy)]" />
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/* Page component                                                       */
/* ------------------------------------------------------------------ */

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [surveyDialogOpen, setSurveyDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: () => apiFetch("/api/notifications?pageSize=50"),
  });

  const markAsRead = useMutation({
    mutationFn: (notificationId: string) =>
      apiFetch("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () =>
      apiFetch("/api/notifications", { method: "PUT" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },
  });

  const notifications = data?.items ?? [];
  const hasUnread = notifications.some((n) => !n.readAt);

  function handleTap(notification: NotificationItem) {
    // Mark as read if unread
    if (!notification.readAt) {
      markAsRead.mutate(notification.id);
    }

    const entityId = notification.relatedEntityId;

    switch (notification.type) {
      case "MATCH_CREATED":
        if (entityId) router.push(`/aligned/1-on-1/${entityId}`);
        break;
      case "GROUP_MATCH_CREATED":
        if (entityId) router.push(`/aligned/group/${entityId}`);
        break;
      case "SURVEY_AVAILABLE":
        setSelectedNotification(notification);
        setSurveyDialogOpen(true);
        break;
      case "EVENT_REMINDER":
        if (entityId) router.push(`/spaces/${entityId}`);
        break;
      case "NUDGE_RECEIVED":
        router.push("/aligned");
        break;
      default:
        // Just mark as read, no navigation
        break;
    }
  }

  return (
    <div className="mx-auto max-w-[640px] px-4 py-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <h1
          className="text-xl font-heading font-semibold"
          style={{ color: "var(--intent-text-primary)" }}
        >
          Notifications
        </h1>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
            className="text-[13px] font-medium text-[var(--intent-navy)] hover:text-[var(--intent-navy)]"
          >
            <CheckCheck size={16} className="mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* ── Loading ─────────────────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[var(--intent-navy)]" />
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────── */}
      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--intent-navy-subtle)]">
            <Bell size={28} style={{ color: "var(--intent-navy)" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--intent-text-secondary)" }}>
            No notifications
          </p>
        </div>
      )}

      {/* ── Notification list ───────────────────────────────────── */}
      {!isLoading && notifications.length > 0 && (
        <div className="divide-y divide-[var(--intent-text-tertiary)] overflow-hidden rounded-2xl bg-white shadow-[var(--card-shadow)]">
          {notifications.map((notification) => {
            const isUnread = !notification.readAt;
            const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            });

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleTap(notification)}
                className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--intent-navy-subtle)]/40"
              >
                <NotificationIcon type={notification.type} />

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[14px] leading-snug ${
                      isUnread
                        ? "font-semibold text-[var(--intent-text-primary)]"
                        : "text-[var(--intent-text-primary)]"
                    }`}
                  >
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="mt-0.5 truncate text-[13px] text-[var(--intent-text-secondary)]">
                      {notification.body}
                    </p>
                  )}
                  <p className="mt-1 text-[12px] text-[var(--intent-text-secondary)]">
                    {timeAgo}
                  </p>
                </div>

                {/* Unread indicator */}
                {isUnread && (
                  <div className="mt-1.5 flex-shrink-0">
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--intent-navy)]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Survey Dialog ───────────────────────────────────────── */}
      <Dialog open={surveyDialogOpen} onOpenChange={setSurveyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedNotification?.title ?? "Survey Available"}
            </DialogTitle>
            <DialogDescription>
              {selectedNotification?.body ??
                "A new survey is available for you to complete."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" className="rounded-xl">
                  Dismiss
                </Button>
              }
            />
            <Button
              className="rounded-xl bg-[var(--intent-navy)] text-white hover:bg-[var(--intent-navy-light)]"
              onClick={() => {
                setSurveyDialogOpen(false);
                if (selectedNotification?.relatedEntityId) {
                  router.push(
                    `/surveys/${selectedNotification.relatedEntityId}`
                  );
                }
              }}
            >
              Take Survey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
