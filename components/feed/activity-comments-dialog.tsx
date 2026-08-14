"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useTransition } from "react"

import { ActivityPost } from "@/components/feed/activity-post"
import { LikeToggle } from "@/components/feed/like-toggle"
import { RelativeTime } from "@/components/feed/relative-time"
import { UserAvatar } from "@/components/profile/user-avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createActivityComment,
  deleteActivityComment,
  loadActivityComments,
  restoreActivityComment,
  toggleCommentLike,
} from "@/lib/activity/actions"
import {
  COMMENT_BODY_MAX,
  type ActivityComment,
  type FeedActivityItem,
} from "@/lib/activity/types"
import { cn } from "@/lib/utils"

type ActivityCommentsDialogProps = {
  item: FeedActivityItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommentAdded?: (activityId: string) => void
}

function CommentsSkeleton() {
  return (
    <ul className="space-y-3 py-4" aria-hidden>
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex gap-2.5">
          <div className="bg-muted size-8 shrink-0 animate-pulse rounded-full" />
          <div className="min-w-0 flex-1 space-y-2 py-0.5">
            <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            <div className="bg-muted h-3 w-full max-w-xs animate-pulse rounded" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function CommentRow({
  comment,
  pending,
  onDelete,
  onRestore,
}: {
  comment: ActivityComment
  pending: boolean
  onDelete: (commentId: string) => void
  onRestore: (commentId: string) => void
}) {
  const profileHref = `/users/${comment.author.username}`

  return (
    <li className="flex gap-2.5 py-3">
      <Link
        href={profileHref}
        className="shrink-0 self-start touch-manipulation"
      >
        <UserAvatar
          userId={comment.author.id}
          username={comment.author.username}
          imageUrl={comment.author.image}
          size={32}
        />
      </Link>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <Link
            href={profileHref}
            className="truncate text-sm font-medium hover:underline underline-offset-4"
          >
            @{comment.author.username}
          </Link>
          <RelativeTime
            date={comment.createdAt}
            className="text-muted-foreground shrink-0 text-[11px]"
          />
        </div>
        {comment.deleted ? (
          <>
            <p className="text-muted-foreground text-sm italic">
              This comment was hidden.
            </p>
            {comment.canRestore ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => onRestore(comment.id)}
                className="text-muted-foreground hover:text-foreground inline-flex min-h-9 items-center text-xs underline-offset-4 hover:underline disabled:opacity-50"
              >
                Show
              </button>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-pretty">
              {comment.body}
            </p>
            <div className="flex items-center gap-2">
              <LikeToggle
                liked={comment.viewerHasLiked}
                likeCount={comment.likeCount}
                compact
                onToggle={() => toggleCommentLike({ commentId: comment.id })}
              />
              {comment.canDelete ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onDelete(comment.id)}
                  aria-label={`Hide comment by @${comment.author.username}`}
                  className="text-muted-foreground hover:text-destructive inline-flex min-h-9 items-center text-xs underline-offset-4 hover:underline disabled:opacity-50"
                >
                  Hide
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
    </li>
  )
}

export function ActivityCommentsDialog({
  item,
  open,
  onOpenChange,
  onCommentAdded,
}: ActivityCommentsDialogProps) {
  const threadRef = useRef<HTMLDivElement>(null)
  const [comments, setComments] = useState<ActivityComment[]>([])
  const [previousCursor, setPreviousCursor] = useState<string | null>(null)
  const [body, setBody] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [posting, startPost] = useTransition()
  const [loadingMore, startLoadMore] = useTransition()
  const [deleting, startDelete] = useTransition()
  const busy = posting || loadingMore || deleting

  useEffect(() => {
    if (!open || !item) {
      setComments([])
      setPreviousCursor(null)
      setBody("")
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setComments([])
    setPreviousCursor(null)
    setBody("")
    setError(null)
    setLoading(true)

    void loadActivityComments({ activityId: item.id }).then((result) => {
      if (cancelled) return
      setLoading(false)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setComments(result.comments)
      setPreviousCursor(result.previousCursor)
      requestAnimationFrame(() => {
        const el = threadRef.current
        if (el) el.scrollTop = el.scrollHeight
      })
    })

    return () => {
      cancelled = true
    }
  }, [open, item?.id])

  function scrollThreadToBottom() {
    const el = threadRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }

  function onLoadPrevious() {
    if (!item || !previousCursor || busy || loading) return
    setError(null)
    const el = threadRef.current
    const previousHeight = el?.scrollHeight ?? 0
    const previousTop = el?.scrollTop ?? 0

    startLoadMore(async () => {
      const result = await loadActivityComments({
        activityId: item.id,
        cursor: previousCursor,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setComments((prev) => [...result.comments, ...prev])
      setPreviousCursor(result.previousCursor)
      requestAnimationFrame(() => {
        if (!el) return
        el.scrollTop = el.scrollHeight - previousHeight + previousTop
      })
    })
  }

  function onPost() {
    if (!item || busy) return
    const trimmed = body.trim()
    if (!trimmed) return
    setError(null)
    startPost(async () => {
      const result = await createActivityComment({
        activityId: item.id,
        body: trimmed,
      })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setComments((prev) => [...prev, result.comment])
      setBody("")
      onCommentAdded?.(item.id)
      requestAnimationFrame(scrollThreadToBottom)
    })
  }

  function onDelete(commentId: string) {
    if (busy) return
    const previous = comments
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              deleted: true,
              body: null,
              canDelete: false,
              canRestore: true,
              likeCount: 0,
              viewerHasLiked: false,
            }
          : comment,
      ),
    )
    setError(null)
    startDelete(async () => {
      const result = await deleteActivityComment({ commentId })
      if (!result.ok) {
        setComments(previous)
        setError(result.message)
      }
    })
  }

  function onRestore(commentId: string) {
    if (busy) return
    const previous = comments
    setError(null)
    startDelete(async () => {
      const result = await restoreActivityComment({ commentId })
      if (!result.ok) {
        setComments(previous)
        setError(result.message)
        return
      }
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? result.comment : comment,
        ),
      )
    })
  }

  const showEmpty = !loading && !error && comments.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(92dvh,40rem)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="shrink-0 space-y-1 px-4 pt-4 pb-3 pr-12">
          <DialogTitle>Comments</DialogTitle>
          <DialogDescription className="sr-only">
            {item
              ? `Comments on @${item.actor.username}'s activity`
              : "Comments on this activity"}
          </DialogDescription>
        </DialogHeader>

        <div
          ref={threadRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4"
        >
          {item ? (
            <div className="border-b border-border pb-4">
              <ActivityPost item={item} />
            </div>
          ) : null}

          {loading ? <CommentsSkeleton /> : null}

          {showEmpty ? (
            <p className="text-muted-foreground py-6 text-sm">
              No comments yet. Be the first.
            </p>
          ) : null}

          {!loading && comments.length > 0 ? (
            <>
              {previousCursor ? (
                <div className="py-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy || loading}
                    onClick={onLoadPrevious}
                    className="min-h-10 sm:min-h-8"
                  >
                    {loadingMore ? "Loading…" : "View previous comments"}
                  </Button>
                </div>
              ) : null}
              <ul className="divide-y divide-border" aria-label="Comments">
                {comments.map((comment) => (
                  <CommentRow
                    key={comment.id}
                    comment={comment}
                    pending={busy}
                    onDelete={onDelete}
                    onRestore={onRestore}
                  />
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <form
          className="shrink-0 space-y-2 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          onSubmit={(e) => {
            e.preventDefault()
            onPost()
          }}
        >
          <label htmlFor="activity-comment-body" className="sr-only">
            Write a comment
          </label>
          <textarea
            id="activity-comment-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={posting || !item}
            maxLength={COMMENT_BODY_MAX}
            rows={2}
            placeholder="Write a comment…"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "activity-comment-error" : undefined}
            className={cn(
              "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors outline-none focus-visible:ring-3 disabled:opacity-50 sm:text-sm dark:bg-input/30",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                onPost()
              }
            }}
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs tabular-nums">
              {body.length}/{COMMENT_BODY_MAX}
            </p>
            <Button
              type="submit"
              size="sm"
              disabled={busy || !body.trim() || !item}
              className="min-h-10 sm:min-h-8"
            >
              {posting ? "Posting…" : "Post"}
            </Button>
          </div>
          {error ? (
            <p
              id="activity-comment-error"
              className="text-destructive text-sm"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  )
}
