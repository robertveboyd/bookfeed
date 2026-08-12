"use client"

import { useState, useTransition } from "react"

import { ActivityCard } from "@/components/feed/activity-card"
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

  if (items.length === 0) {
    if (friendCount === 0) {
      return (
        <EmptyState
          className="my-4"
          title="Your feed is quiet"
          description="Add friends to see when they start reading, finish books, or leave ratings and reviews."
          action={{ href: "/friends", label: "Find friends" }}
        />
      )
    }

    return (
      <EmptyState
        className="my-4"
        title="No activity yet"
        description="Your friends haven’t started reading, finished a book, or left a rating yet. Check back soon."
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
          <ActivityCard key={item.id} item={item} />
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
          >
            {pending ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-destructive mt-2 text-sm">{error}</p> : null}
    </div>
  )
}
