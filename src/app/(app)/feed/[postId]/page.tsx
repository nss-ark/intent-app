"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Flag,
  Loader2,
  MoreHorizontal,
  Send,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiFetch } from "@/hooks/use-api";
import { AvatarPlaceholder } from "@/components/avatar-placeholder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface PostAuthor {
  id: string;
  fullName: string;
  photoUrl: string | null;
}

interface PostDetail {
  id: string;
  authorId: string;
  feedType: "CAMPUS" | "NETWORK";
  body: string;
  status: string;
  createdAt: string;
  author: PostAuthor;
  _count: { replies: number };
}

interface ReplyItem {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: PostAuthor;
}

interface RepliesResponse {
  items: ReplyItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface MeResponse {
  id: string;
  fullName: string;
  photoUrl: string | null;
  userType: string;
}

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "OTHER", label: "Other" },
] as const;

/* ------------------------------------------------------------------ */
/* Report dialog                                                       */
/* ------------------------------------------------------------------ */

function ReportDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string, description?: string) => void;
  isPending: boolean;
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit() {
    if (!reason) return;
    onSubmit(reason, description.trim() || undefined);
    setReason("");
    setDescription("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setReason("");
          setDescription("");
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Help us understand what is wrong with this post
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-[13px] font-medium text-[var(--intent-text-primary)]">
            Reason
          </p>
          <div className="space-y-1.5">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className={cn(
                  "flex w-full items-center rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
                  reason === r.value
                    ? "border-[var(--intent-amber)] bg-[var(--intent-amber-subtle)] text-[var(--intent-text-primary)]"
                    : "border-[var(--intent-text-tertiary)] text-[var(--intent-text-secondary)] hover:bg-[var(--muted)]"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[13px] font-medium text-[var(--intent-text-primary)]">
            Additional details (optional)
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
            placeholder="Tell us more..."
            rows={3}
            className="w-full resize-none rounded-lg border border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)] px-3 py-2 text-[13px] text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)] focus:border-[var(--intent-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--intent-amber)]/20"
          />
        </div>

        <DialogFooter>
          <DialogClose
            className="rounded-lg border border-[var(--intent-text-tertiary)] px-4 py-2 text-[13px] font-medium text-[var(--intent-text-primary)] transition-colors hover:bg-[var(--muted)]"
          >
            Cancel
          </DialogClose>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !reason}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--intent-destructive)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Submit Report
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Reply item                                                          */
/* ------------------------------------------------------------------ */

function ReplyCard({ reply }: { reply: ReplyItem }) {
  return (
    <div className="flex gap-3 py-3">
      <AvatarPlaceholder name={reply.author.fullName} size={32} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="truncate text-[14px] font-semibold text-[var(--intent-text-primary)]">
            {reply.author.fullName}
          </p>
          <span className="shrink-0 text-[11px] text-[var(--intent-text-secondary)]">
            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--intent-text-primary)]">
          {reply.body}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function PostDetailPage() {
  const params = useParams<{ postId: string }>();
  const postId = params.postId as string;
  const router = useRouter();
  const qc = useQueryClient();

  const [replyText, setReplyText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch current user
  const { data: me } = useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/users/me"),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch post detail
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useQuery<PostDetail>({
    queryKey: ["post", postId],
    queryFn: () => apiFetch(`/api/posts/${postId}`),
    enabled: !!postId,
  });

  // Fetch replies
  const {
    data: repliesData,
    isLoading: repliesLoading,
  } = useQuery<RepliesResponse>({
    queryKey: ["post-replies", postId],
    queryFn: () => apiFetch(`/api/posts/${postId}/replies?pageSize=50`),
    enabled: !!postId,
  });

  // Create reply mutation
  const createReply = useMutation({
    mutationFn: (body: string) =>
      apiFetch(`/api/posts/${postId}/replies`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    onSuccess: () => {
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["post-replies", postId] });
      qc.invalidateQueries({ queryKey: ["post", postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: () => apiFetch(`/api/posts/${postId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      router.push("/feed");
    },
  });

  // Report post mutation
  const reportPost = useMutation({
    mutationFn: ({
      reason,
      description,
    }: {
      reason: string;
      description?: string;
    }) =>
      apiFetch(`/api/posts/${postId}/report`, {
        method: "POST",
        body: JSON.stringify({ reason, description }),
      }),
    onSuccess: () => {
      setReportOpen(false);
    },
  });

  function handleSendReply() {
    const body = replyText.trim();
    if (!body) return;
    createReply.mutate(body);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  }

  const replies = repliesData?.items ?? [];
  const isOwn = post?.authorId === me?.id;

  // Loading state
  if (postLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] items-center justify-center bg-[var(--intent-bg)]">
        <Loader2
          size={28}
          className="animate-spin text-[var(--intent-amber)]"
        />
      </div>
    );
  }

  // Error / not found
  if (postError || !post) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col items-center justify-center bg-[var(--intent-bg)] px-4">
        <p className="text-[15px] font-medium text-[var(--intent-text-primary)]">
          Post not found
        </p>
        <Link
          href="/feed"
          className="mt-3 text-[14px] font-medium text-[var(--intent-amber)] hover:underline"
        >
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col bg-[var(--intent-bg)]">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--intent-text-tertiary)] bg-white/95 px-3 py-2.5 backdrop-blur-md">
        <Link
          href="/feed"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--intent-amber-subtle)]"
          aria-label="Back to feed"
        >
          <ArrowLeft
            size={20}
            strokeWidth={1.5}
            className="text-[var(--intent-text-primary)]"
          />
        </Link>
        <h1 className="flex-1 text-[16px] font-semibold text-[var(--intent-text-primary)]">
          Post
        </h1>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
            aria-label="Post actions"
          >
            <MoreHorizontal
              size={18}
              strokeWidth={1.5}
              className="text-[var(--intent-text-secondary)]"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem onClick={() => setReportOpen(true)}>
              <Flag size={14} />
              Report
            </DropdownMenuItem>
            {isOwn && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 size={14} />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* ── Post content ────────────────────────────────────────────── */}
      <div className="border-b border-[var(--intent-text-tertiary)] bg-white px-4 py-4">
        <div className="flex items-start gap-3">
          <AvatarPlaceholder name={post.author.fullName} size={44} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-semibold text-[var(--intent-text-primary)]">
              {post.author.fullName}
            </p>
            <p className="text-[12px] text-[var(--intent-text-secondary)]">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
              {" "}
              <span className="text-[var(--intent-text-tertiary)]">&middot;</span>
              {" "}
              {post.feedType === "CAMPUS" ? "Campus" : "Network"}
            </p>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--intent-text-primary)]">
          {post.body}
        </p>

        <div className="mt-4 border-t border-[var(--intent-text-tertiary)] pt-3">
          <p className="text-[13px] text-[var(--intent-text-secondary)]">
            {post._count.replies}{" "}
            {post._count.replies === 1 ? "reply" : "replies"}
          </p>
        </div>
      </div>

      {/* ── Replies ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {repliesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2
              size={20}
              className="animate-spin text-[var(--intent-amber)]"
            />
          </div>
        ) : replies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-[14px] text-[var(--intent-text-secondary)]">
              No replies yet. Be the first to respond!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--intent-text-tertiary)]">
            {replies.map((reply) => (
              <ReplyCard key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom reply composer ────────────────────────────────────── */}
      <div className="sticky bottom-0 border-t border-[var(--intent-text-tertiary)] bg-white px-3 py-2.5 safe-bottom">
        <div className="flex items-end gap-2">
          <div className="flex min-h-[40px] flex-1 items-center rounded-xl border border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)] px-3">
            <textarea
              value={replyText}
              onChange={(e) =>
                setReplyText(e.target.value.slice(0, 1000))
              }
              onKeyDown={handleKeyDown}
              placeholder="Write a reply..."
              rows={1}
              className="w-full resize-none bg-transparent py-2 text-[14px] text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)] focus:outline-none"
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
          </div>
          <button
            type="button"
            onClick={handleSendReply}
            disabled={createReply.isPending || !replyText.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--intent-amber)] shadow-sm transition-colors hover:bg-[var(--intent-amber-light)] disabled:opacity-50"
            aria-label="Send reply"
          >
            {createReply.isPending ? (
              <Loader2
                size={18}
                strokeWidth={2}
                className="animate-spin text-white"
              />
            ) : (
              <Send size={18} strokeWidth={2} className="text-white" />
            )}
          </button>
        </div>
        <p className="mt-1 text-right text-[11px] text-[var(--intent-text-secondary)]">
          {replyText.length}/1000
        </p>
      </div>

      {/* ── Report dialog ───────────────────────────────────────────── */}
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSubmit={(reason, description) =>
          reportPost.mutate({ reason, description })
        }
        isPending={reportPost.isPending}
      />

      {/* ── Delete confirmation dialog ──────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              className="rounded-lg border border-[var(--intent-text-tertiary)] px-4 py-2 text-[13px] font-medium text-[var(--intent-text-primary)] transition-colors hover:bg-[var(--muted)]"
            >
              Cancel
            </DialogClose>
            <button
              type="button"
              onClick={() => deletePost.mutate()}
              disabled={deletePost.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--intent-destructive)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {deletePost.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
