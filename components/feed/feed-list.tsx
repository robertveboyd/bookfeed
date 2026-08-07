"use client"

import { useState, useTransition } from "react"
import Link from "next/link"

import { ActivityCard } from "@/components/feed/activity-card"
import { Button } from "@/components/ui/button"
import { loadMoreFeed } from "@/lib/activity/actions"
import type { FeedActivityItem } from "@/lib/activity/types"

type FeedListProps = {
  initialItems: FeedActivityItem[]
  initialCursor: string | null
}

export function FeedList({ initialItems, initialCursor }: FeedListProps) {
  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState(initialCursor)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (items.length === 0) {
    return (
      <div className="space-y-3 py-8">
        <p className="text-muted-foreground text-sm">
          No friend activity yet. When friends start reading, finish books, or
          rate them, it will show up here.
        </p>
        <p>
          <Link
            href="/friends"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Find friends →
          </Link>
        </p>
      </div>
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
