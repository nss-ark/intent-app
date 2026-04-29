"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Flag,
  Trash2,
  Send,
  Megaphone,
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

interface PostItem {
  id: string;
  authorId: string;
  feedType: "CAMPUS" | "NETWORK";
  body: string;
  status: string;
  createdAt: string;
  author: PostAuthor;
  _count: { replies: number };
}

interface PostsResponse {
  items: PostItem[];
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

type FeedType = "CAMPUS" | "NETWORK";

const REPORT_REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "HARASSMENT", label: "Harassment" },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "MISINFORMATION", label: "Misinformation" },
  { value: "OTHER", label: "Other" },
] as const;

/* ------------------------------------------------------------------ */
/* Skeleton card                                                       */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--intent-text-tertiary)]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-[var(--intent-text-tertiary)]" />
          <div className="h-3 w-20 rounded bg-[var(--intent-text-tertiary)]" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-[var(--intent-text-tertiary)]" />
        <div className="h-3 w-3/4 rounded bg-[var(--intent-text-tertiary)]" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Post card                                                           */
/* ------------------------------------------------------------------ */

function PostCard({
  post,
  currentUserId,
  onReport,
  onDelete,
}: {
  post: PostItem;
  currentUserId: string | undefined;
  onReport: (postId: string) => void;
  onDelete: (postId: string) => void;
}) {
  const isOwn = post.authorId === currentUserId;

  return (
    <div className="rounded-xl border border-[var(--intent-text-tertiary)] bg-white p-4">
      {/* Author row */}
      <div className="flex items-start gap-3">
        <AvatarPlaceholder name={post.author.fullName} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-[var(--intent-text-primary)]">
            {post.author.fullName}
          </p>
          <p className="text-[12px] text-[var(--intent-text-secondary)]">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--muted)]"
            aria-label="Post actions"
          >
            <MoreHorizontal size={18} strokeWidth={1.5} className="text-[var(--intent-text-secondary)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            <DropdownMenuItem onClick={() => onReport(post.id)}>
              <Flag size={14} />
              Report
            </DropdownMenuItem>
            {isOwn && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 size={14} />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post body */}
      <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--intent-text-primary)]">
        {post.body}
      </p>

      {/* Bottom row: reply count + reply link */}
      <div className="mt-3 flex items-center gap-4 border-t border-[var(--intent-text-tertiary)] pt-3">
        <Link
          href={`/feed/${post.id}`}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--intent-text-secondary)] transition-colors hover:text-[var(--intent-amber)]"
        >
          <MessageCircle size={16} strokeWidth={1.5} />
          {post._count.replies > 0
            ? `${post._count.replies} ${post._count.replies === 1 ? "reply" : "replies"}`
            : "Reply"}
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compose dialog                                                      */
/* ------------------------------------------------------------------ */

function ComposeDialog({
  open,
  onOpenChange,
  feedType,
  isStudent,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedType: FeedType;
  isStudent: boolean;
  onSubmit: (feedType: FeedType, body: string) => void;
  isPending: boolean;
}) {
  const [body, setBody] = useState("");
  const [selectedFeed, setSelectedFeed] = useState<FeedType>(feedType);
  const maxLength = 2000;

  function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    onSubmit(selectedFeed, trimmed);
    setBody("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setBody("");
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Post</DialogTitle>
          <DialogDescription>Share something with your community</DialogDescription>
        </DialogHeader>

        {/* Feed type selector */}
        {isStudent && (
          <div className="flex gap-1 rounded-xl bg-[var(--muted)] p-1">
            {(["CAMPUS", "NETWORK"] as const).map((ft) => (
              <button
                key={ft}
                type="button"
                onClick={() => setSelectedFeed(ft)}
                className={cn(
                  "flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-all",
                  selectedFeed === ft
                    ? "bg-white text-[var(--intent-text-primary)] shadow-sm"
                    : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
                )}
              >
                {ft === "CAMPUS" ? "Campus" : "Network"}
              </button>
            ))}
          </div>
        )}

        {/* Body textarea */}
        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, maxLength))}
            placeholder="What's on your mind?"
            rows={5}
            className="w-full resize-none rounded-lg border border-[var(--intent-text-tertiary)] bg-[var(--intent-bg)] px-3 py-2.5 text-[14px] text-[var(--intent-text-primary)] placeholder:text-[var(--intent-text-secondary)] focus:border-[var(--intent-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--intent-amber)]/20"
          />
          <span className="absolute right-3 bottom-2.5 text-[11px] text-[var(--intent-text-secondary)]">
            {body.length}/{maxLength}
          </span>
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
            disabled={isPending || !body.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--intent-amber)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)] disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Post
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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

        {/* Reason selector */}
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

        {/* Optional description */}
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
/* Page component                                                      */
/* ------------------------------------------------------------------ */

export default function FeedPage() {
  const qc = useQueryClient();

  // Compose dialog state
  const [composeOpen, setComposeOpen] = useState(false);

  // Report dialog state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<string | null>(null);

  // Delete confirmation
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  // Fetch current user
  const { data: me } = useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => apiFetch("/api/users/me"),
    staleTime: 2 * 60 * 1000,
  });

  const isStudent = me?.userType === "STUDENT";
  const defaultFeed: FeedType = isStudent ? "CAMPUS" : "NETWORK";
  const [feedType, setFeedType] = useState<FeedType | null>(null);

  // Resolve the active feed (wait for me to load for default)
  const activeFeed = feedType ?? (me ? defaultFeed : null);

  // Fetch posts
  const {
    data: postsData,
    isLoading,
  } = useQuery<PostsResponse>({
    queryKey: ["posts", activeFeed],
    queryFn: () => apiFetch(`/api/posts?feedType=${activeFeed}&pageSize=20`),
    enabled: !!activeFeed,
  });

  // Create post mutation
  const createPost = useMutation({
    mutationFn: (data: { feedType: FeedType; body: string }) =>
      apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      setComposeOpen(false);
    },
  });

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: (postId: string) =>
      apiFetch(`/api/posts/${postId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      setDeletePostId(null);
    },
  });

  // Report post mutation
  const reportPost = useMutation({
    mutationFn: ({
      postId,
      reason,
      description,
    }: {
      postId: string;
      reason: string;
      description?: string;
    }) =>
      apiFetch(`/api/posts/${postId}/report`, {
        method: "POST",
        body: JSON.stringify({ reason, description }),
      }),
    onSuccess: () => {
      setReportOpen(false);
      setReportPostId(null);
    },
  });

  const posts = postsData?.items ?? [];
  const totalPages = postsData?.totalPages ?? 1;
  const currentPage = postsData?.page ?? 1;

  function handleReport(postId: string) {
    setReportPostId(postId);
    setReportOpen(true);
  }

  function handleDelete(postId: string) {
    setDeletePostId(postId);
  }

  return (
    <div className="min-h-screen bg-[var(--intent-bg)]">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 pt-6">
        <h1 className="font-heading text-[24px] font-bold text-[var(--intent-text-primary)]">
          Feed
        </h1>

        {/* ── Feed toggle ──────────────────────────────────────────── */}
        <div className="mt-4 flex gap-1 rounded-xl bg-[var(--muted)] p-1">
          {isStudent && (
            <button
              type="button"
              onClick={() => setFeedType("CAMPUS")}
              className={cn(
                "flex-1 rounded-lg py-2 text-[14px] font-medium transition-all",
                activeFeed === "CAMPUS"
                  ? "bg-white text-[var(--intent-text-primary)] shadow-sm"
                  : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
              )}
            >
              Campus
            </button>
          )}
          <button
            type="button"
            onClick={() => setFeedType("NETWORK")}
            className={cn(
              "flex-1 rounded-lg py-2 text-[14px] font-medium transition-all",
              activeFeed === "NETWORK"
                ? "bg-white text-[var(--intent-text-primary)] shadow-sm"
                : "text-[var(--intent-text-secondary)] hover:text-[var(--intent-text-primary)]"
            )}
          >
            Network
          </button>
        </div>

        {/* ── Composer bar ─────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setComposeOpen(true)}
          className="mt-4 flex w-full items-center gap-3 rounded-xl border border-[var(--intent-text-tertiary)] bg-white px-4 py-3 text-left transition-colors hover:bg-[var(--muted)]"
        >
          {me && <AvatarPlaceholder name={me.fullName} size={36} />}
          <span className="flex-1 text-[14px] text-[var(--intent-text-secondary)]">
            What&apos;s on your mind?
          </span>
        </button>
      </div>

      {/* ── Posts ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[640px] px-4 py-4 pb-32">
        {isLoading || !activeFeed ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
              <Megaphone
                size={28}
                strokeWidth={1.5}
                className="text-[var(--intent-text-secondary)]"
              />
            </div>
            <p className="mt-4 text-[15px] font-medium text-[var(--intent-text-primary)]">
              Be the first to post!
            </p>
            <p className="mt-1 text-center text-[13px] text-[var(--intent-text-secondary)]">
              {activeFeed === "CAMPUS"
                ? "Share something with your campus community."
                : "Start a conversation with the network."}
            </p>
            <button
              type="button"
              onClick={() => setComposeOpen(true)}
              className="mt-4 rounded-xl bg-[var(--intent-amber)] px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--intent-amber-light)]"
            >
              Create a post
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={me?.id}
                onReport={handleReport}
                onDelete={handleDelete}
              />
            ))}

            {/* Load more */}
            {currentPage < totalPages && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    // For now, we just show first page. In the future, implement
                    // infinite scroll with useInfiniteQuery.
                  }}
                  className="rounded-lg border border-[var(--intent-text-tertiary)] px-4 py-2 text-[13px] font-medium text-[var(--intent-text-secondary)] transition-colors hover:bg-[var(--muted)]"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── FAB (mobile) ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setComposeOpen(true)}
        className="fixed right-4 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--intent-amber)] shadow-lg transition-transform hover:scale-105 active:scale-95 md:bottom-8"
        aria-label="New post"
      >
        <Plus size={24} strokeWidth={2} className="text-white" />
      </button>

      {/* ── Compose dialog ──────────────────────────────────────────── */}
      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        feedType={activeFeed ?? "NETWORK"}
        isStudent={isStudent}
        onSubmit={(ft, body) => createPost.mutate({ feedType: ft, body })}
        isPending={createPost.isPending}
      />

      {/* ── Report dialog ───────────────────────────────────────────── */}
      <ReportDialog
        open={reportOpen}
        onOpenChange={(v) => {
          setReportOpen(v);
          if (!v) setReportPostId(null);
        }}
        onSubmit={(reason, description) => {
          if (reportPostId) {
            reportPost.mutate({ postId: reportPostId, reason, description });
          }
        }}
        isPending={reportPost.isPending}
      />

      {/* ── Delete confirmation dialog ──────────────────────────────── */}
      <Dialog
        open={!!deletePostId}
        onOpenChange={(v) => {
          if (!v) setDeletePostId(null);
        }}
      >
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
              onClick={() => {
                if (deletePostId) deletePost.mutate(deletePostId);
              }}
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
