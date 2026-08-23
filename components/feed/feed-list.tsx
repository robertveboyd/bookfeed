"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"

import { ActivityCard } from "@/components/feed/activity-card"
import { ActivityCommentsDialog } from "@/components/feed/activity-comments-dialog"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { loadFeedActivity, loadMoreFeed } from "@/lib/activity/actions"
import type { FeedActivityItem } from "@/lib/activity/types"

type FeedListProps = {
  initialItems: FeedActivityItem[]
  initialCursor: string | null
  friendCount: number
  deepLinkActivityId?: string | null
  deepLinkOpenComments?: boolean
}

export function FeedList({
  initialItems,
  initialCursor,
  friendCount,
  deepLinkActivityId = null,
  deepLinkOpenComments = false,
}: FeedListProps) {
  const scrollRootRef = useRef<HTMLElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [scrollRootReady, setScrollRootReady] = useState(false)

  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState(initialCursor)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [commentActivityId, setCommentActivityId] = useState<string | null>(
    null,
  )
  const [deepLinkItem, setDeepLinkItem] = useState<FeedActivityItem | null>(
    null,
  )
  const [deepLinkHandled, setDeepLinkHandled] = useState(false)

  const commentItem =
    commentActivityId !== null
      ? (items.find((row) => row.id === commentActivityId) ??
        (deepLinkItem?.id === commentActivityId ? deepLinkItem : null))
      : null

  const loadMore = useCallback(() => {
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
  }, [cursor, pending])

  useInfiniteScroll({
    scrollRootRef,
    sentinelRef,
    hasMore: cursor !== null,
    isLoading: pending,
    onLoadMore: loadMore,
    itemCount: items.length,
    scrollRootReady,
  })

  useEffect(() => {
    scrollRootRef.current = document.querySelector("main")
    setScrollRootReady(true)
  }, [])

  useEffect(() => {
    if (!deepLinkActivityId || deepLinkHandled) return

    const inFeed = initialItems.find((row) => row.id === deepLinkActivityId)
    if (inFeed) {
      if (deepLinkOpenComments) {
        setCommentActivityId(deepLinkActivityId)
      }
      setDeepLinkHandled(true)
      return
    }

    let cancelled = false
    void loadFeedActivity({ activityId: deepLinkActivityId }).then((result) => {
      if (cancelled || !result.ok) {
        setDeepLinkHandled(true)
        return
      }
      setDeepLinkItem(result.item)
      if (deepLinkOpenComments) {
        setCommentActivityId(result.item.id)
      }
      setDeepLinkHandled(true)
    })

    return () => {
      cancelled = true
    }
  }, [
    deepLinkActivityId,
    deepLinkHandled,
    deepLinkOpenComments,
    initialItems,
  ])

  if (items.length === 0) {
    if (friendCount === 0) {
      return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <EmptyState
            className="min-h-0 flex-1 items-center justify-center text-center"
            title="Your feed is quiet"
            description="Add friends to see what they’re reading — you can like and comment on their updates. Your own reading will show up here too."
          />
        </div>
      )
    }

    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <EmptyState
          className="min-h-0 flex-1 items-center justify-center text-center"
          title="No activity yet"
          description="When you or your friends start a book, finish one, or leave a rating, it’ll show up here — ready to like and comment."
          action={{ href: "/friends", label: "View friends" }}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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

      <div
        ref={sentinelRef}
        aria-hidden
        className="h-px w-full shrink-0"
      />

      {pending ? (
        <p
          className="text-muted-foreground py-6 text-center text-sm"
          aria-live="polite"
        >
          Loading more…
        </p>
      ) : null}

      {error ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <p className="text-destructive text-sm">{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadMore}
            className="min-h-10 sm:min-h-8"
          >
            Try again
          </Button>
        </div>
      ) : null}

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
