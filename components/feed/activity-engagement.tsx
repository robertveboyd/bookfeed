"use client"

import { MessageCircleIcon } from "lucide-react"

import { LikeToggle } from "@/components/feed/like-toggle"
import { toggleActivityLike } from "@/lib/activity/actions"

type ActivityEngagementProps = {
  activityId: string
  likeCount: number
  commentCount: number
  viewerHasLiked: boolean
  commentsOpen?: boolean
  onLikeChange?: (next: { liked: boolean; likeCount: number }) => void
  onOpenComments?: () => void
}

function commentsLabel(count: number, open: boolean) {
  const noun = count === 1 ? "comment" : "comments"
  return open ? `Hide ${count} ${noun}` : `View ${count} ${noun}`
}

export function ActivityEngagement({
  activityId,
  likeCount,
  commentCount,
  viewerHasLiked,
  commentsOpen = false,
  onLikeChange,
  onOpenComments,
}: ActivityEngagementProps) {
  return (
    <div className="pt-1">
      <div className="flex items-center gap-0.5 sm:gap-1">
        <LikeToggle
          liked={viewerHasLiked}
          likeCount={likeCount}
          onToggle={() => toggleActivityLike({ activityId })}
          onChange={onLikeChange}
        />

        <button
          type="button"
          onClick={onOpenComments}
          aria-expanded={commentsOpen}
          aria-haspopup="dialog"
          aria-label={commentsLabel(commentCount, commentsOpen)}
          className="text-muted-foreground hover:text-foreground inline-flex min-h-10 items-center gap-1.5 rounded-md px-2.5 text-sm touch-manipulation hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-9 sm:px-2"
        >
          <MessageCircleIcon className="size-4" aria-hidden />
          <span className="tabular-nums text-xs font-medium" aria-hidden>
            {commentCount}
          </span>
        </button>
      </div>
    </div>
  )
}
