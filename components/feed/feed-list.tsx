"use client"

import { useState, useTransition } from "react"

import { ActivityCard } from "@/components/feed/activity-card"
import { ActivityCommentsDialog } from "@/components/feed/activity-comments-dialog"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { loadMoreFeed } from "@/lib/activity/actions"
import type { FeedActivityItem } from "@/lib/activity/types"

type FeedListProps = {
  initialItems: FeedActivityItem[]
  initialCursor: string | null
  friendCount: number
}

export function FeedList({
  initialItems,
  initialCursor,
  friendCount,
}: FeedListProps) {
  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState(initialCursor)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [commentActivityId, setCommentActivityId] = useState<string | null>(
    null,
  )
  const commentItem = commentActivityId
    ? (items.find((row) => row.id === commentActivityId) ?? null)
    : null

  if (items.length === 0) {
    if (friendCount === 0) {
      return (
        <EmptyState
          className="my-4"
          title="Your feed is quiet"
          description="Add friends to see what they’re reading — you can like and comment on their updates. Your own reading will show up here too."
          action={{ href: "/friends", label: "Find friends" }}
        />
      )
    }

    return (
        <EmptyState
          className="my-4"
          title="No activity yet"
          description="When you or your friends start a book, finish one, or leave a rating, it’ll show up here — ready to like and comment."
          action={{ href: "/friends", label: "View friends" }}
        />
    )
  }

  function onLoadMore() {
    if (!cursor || pending) return
    setError(null)
    startTransition(async () => {
      const result = await loadMoreFeed({ cursor })
      if (!result.ok) {
        setError(result.message)
        return
      }
      setItems((prev) => [...prev, ...result.items])
      setCursor(result.nextCursor)
    })
  }

  return (
    <div>
      <div className="divide-y-0">
        {items.map((item) => (
          <ActivityCard
            key={item.id}
            item={item}
            commentsOpen={commentActivityId === item.id}
            onLikeChange={(next) => {
              setItems((prev) =>
                prev.map((row) =>
                  row.id === item.id
                    ? {
                        ...row,
                        viewerHasLiked: next.liked,
                        likeCount: next.likeCount,
                      }
                    : row,
                ),
              )
            }}
            onOpenComments={() => {
              setCommentActivityId(item.id)
            }}
          />
        ))}
      </div>

      {cursor ? (
        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={onLoadMore}
            className="min-h-10 sm:min-h-8"
          >
            {pending ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-destructive mt-2 text-sm">{error}</p> : null}

      <ActivityCommentsDialog
        item={commentItem}
        open={commentActivityId !== null}
        onOpenChange={(open) => {
          if (!open) setCommentActivityId(null)
        }}
        onCommentAdded={(activityId) => {
          setItems((prev) =>
            prev.map((row) =>
              row.id === activityId
                ? { ...row, commentCount: row.commentCount + 1 }
                : row,
            ),
          )
        }}
      />
    </div>
  )
}
